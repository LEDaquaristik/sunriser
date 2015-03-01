package SunRiser::Simulator;
# ABSTRACT: SunRiser simulator application class

use MooX qw(
  Options
);

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_SIMULATOR' }

use AnyEvent;
use Twiggy::Server;
use Plack::Builder;
use Path::Tiny;
use File::ShareDir::ProjectDistDir;
use Plack::Util;
use HTTP::Date;
use Plack::Request;
use POSIX qw( floor );
use JSON::MaybeXS;
use Digest::DJB32 qw( djb );
use File::Temp qw/ tempfile tempdir tmpnam /;
use bytes;
use Carp qw( croak );
use Data::MessagePack;
use CDB::TinyCDB;
use SunRiser::Publisher;
use SunRiser::CDB;
use SunRiser;

has versioned => (
  is => 'lazy',
);

sub _build_versioned { $SunRiser::VERSION || $ENV{V} || 0 }

option model => (
  is => 'ro',
  format => 's',
  lazy => 1,
  default => sub { 'sr8' },
  doc => 'model id to simulate',
);

has model_info => (
  is => 'lazy',
);

sub _build_model_info {
  my ( $self ) = @_;
  my $model_info = SunRiser->model_info($self->model);
  croak("No model info for ".$self->model) unless $model_info;
  return $model_info;
}

option port => (
  is => 'ro',
  format => 'i',
  lazy => 1,
  default => sub { 9000 },
  doc => 'port for the webserver',
);

option password => (
  is => 'ro',
  format => 's',
  default => sub { 'test' },
  doc => 'password for login',
);

option systemdb => (
  is => 'ro',
  format => 's@',
  predicate => 1,
  short => 's',
  doc => 'CDB file for read only system storages',
);

has system_cdbs => (
  is => 'lazy',
);

sub _build_system_cdbs {
  my ( $self ) = @_;
  return $self->has_systemdb ? [map { SunRiser::CDB->new(
    filename => $_,
    config => $self->config,
  )} @{$self->systemdb}] : [];
}

option demo => (
  is => 'ro',
  default => sub { 0 },
  doc => 'Demo Website Mode (using session)',
);

option demo_cache => (
  is => 'ro',
  default => sub { 
    my ( $self ) = @_;
    return path($ENV{HOME},'.srdemocache',$self->versioned || getppid())->absolute;
  },
  doc => 'Demo Cache Directory',
);

option no_fallback => (
  is => 'ro',
  format => 'i',
  default => sub { 0 },
  doc => 'Only use CDBs',
);

option webdir => (
  is => 'ro',
  format => 's',
  init_arg => 'web',
  doc => 'Directory to use for serving webfiles',
  default => sub { path(dist_dir('SunRiser'),'web')->stringify },
);

has w => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_w {
  my ( $self ) = @_;
  my $w = path($self->webdir)->absolute->realpath;
  return $w;
}

option configdir => (
  is => 'ro',
  format => 's',
  init_arg => 'config',
  doc => 'Directory to use for storing local saved config',
  default => sub { path('config')->stringify },
);

has c => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_c {
  my ( $self ) = @_;
  croak("Can't use config directory on demo mode") if $self->demo;
  my $c = path($self->configdir)->absolute->realpath;
  $c->mkpath;
  return $c;
}

has state => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_state {
  my ( $self ) = @_;
  my $pwms = $self->model_info->{pwm_count};
  return {
    pwmloop_stopped => 0,
    # PWM name is a number but must be treated like a string
    pwms => { map { $_."", 100 } 1..$pwms }
  };
}

has started => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_started {
  my ( $self ) = @_;
  return $self->get_time();
}

has cdbs => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_cdbs {
  my ( $self ) = @_;
  return [
    (reverse @{$self->system_cdbs})
  ];
}

sub get {
  my ( $self, $key, $env ) = @_;
  my @val = $self->get_config($key, $env);
  return $val[0] if scalar @val == 1;
  if ($self->has_systemdb) {
    for my $cdb (@{$self->cdbs}) {
      return $cdb->get($key) if $cdb->exists($key);
    }
  } else {
    my $default = $self->config->default($key);
    return $default if defined $default;
  }
  return $self->model_info->{$key} if defined $self->model_info->{$key};
  return undef;
}

sub get_config {
  my ( $self, $key, $env ) = @_;
  if ($self->demo) {
    if (defined $env->{'psgix.session'}->{config} && exists $env->{'psgix.session'}->{config}->{$key}) {
      return $env->{'psgix.session'}->{config}->{$key};
    }
  } else {
    my $djb = djb($key);
    my $mpkey = $self->_mp->pack($key);
    my $filename = sprintf("%08X.MP", $djb);
    my $path = path($self->c, $filename);
    if (-f $path) {
      my $file = $path->slurp_raw();
      my $datakey = substr($file, 0, length($mpkey));
      my $data = substr($file, length($mpkey));
      my $ckey = $self->_mp->unpack($datakey);
      if ($ckey eq $key) {
        return $self->_mp->unpack($data);
      } else {
        $self->debug($ckey." in config file is not ".$key."!!!");
      }
    }
  }
  return;
}

sub exists {
  my ( $self, $key, $env ) = @_;
  for my $cdb (@{$self->cdbs}) {
    return 1 if $cdb->exists($key, $env);
  }
  return 1 if defined $self->model_info->{$key};
  return 0;
}

sub set {
  my ( $self, $key, $val, $env ) = @_;
  if ($self->demo) {
    $env->{'psgix.session'}->{config} = {} unless defined $env->{'psgix.session'}->{config};
    $env->{'psgix.session'}->{config}->{$key} = $val;
  } else {
    my $djb = djb($key);
    my $filename = sprintf("%08X.MP",$djb);
    my @data;
    my $p = path($self->c,$filename)->touch;
    push @data, $self->_mp->pack($key);
    push @data, $self->_mp->pack($val);
    $p->spew_raw(@data);
  }
}

sub _web_ok { $_[0]->debug("Sending OK"); [
  200,
  [ "Content-Type" => "text/plain" ],
  [ "OK" ]
]}

sub _web_forbidden { $_[0]->debug("Request forbidden"); [
  403,
  [ "Content-Type" => "text/plain" ],
  [ "FORBIDDEN" ]
]}

sub _web_unauthorized { $_[0]->debug("Request unauthorized"); [
  401,
  [ "Content-Type" => "text/plain" ],
  [ "UNAUTHORIZED" ]
]}

sub _web_notfound { $_[0]->debug("Not found"); [
  404,
  [ "Content-Type" => "text/plain" ],
  [ "NOT FOUND" ]
]}

sub _web_servererror { $_[0]->debug("Nothing todo, sending Internal Server Error"); [
  500,
  [ "Content-Type" => "text/plain" ],
  [ "INTERNAL SERVER ERROR" ]
]}

sub _web_serve_msgpack {
  my ( $self, $data, @headers ) = @_;
  my $msgpack = $self->_mp->pack($data);
  return [ 200, [
    'Content-Type' => 'application/x-msgpack',
    'Content-Length' => length($msgpack),
    @headers
  ], [ $msgpack ] ];
}

sub _web_serve_file {
  my ( $self, $filename, @headers ) = @_;

  my $file = $self->w->child($filename);

  my ( $ext ) = $file =~ m/\.(\w+)$/;

  for my $pfile ($filename) {
    if ($self->has_publish_file($pfile)) {
      ( $ext ) = $pfile =~ m/\.(\w+)$/;
      if ($self->demo && $self->demo_cache) {
        $file = path($self->demo_cache,$pfile);
        unless (-f $file) {
          $file->parent->mkpath;
          $file->spew_utf8($self->render($pfile));
        }
      } else {
        my $tfile = tmpnam();
        $file = path($tfile);
        $file->spew_utf8($self->render($pfile));
      }
      last;
    }
  }

  unless (-f $file) {
    if (-d $file) {
      my $index = $file->child('index.html');
      if (-f $index) {
        $file = $index;
      } else {
        # Feature option: directory listing
        return $self->_web_notfound;        
      }
    } else {
      return $self->_web_notfound;
    }
  }

  my $content_type;
  my $parse = 0;

  unless ($content_type) {
    if ($ext eq 'html') {
      $content_type = 'text/html; charset=utf-8';
      $parse = 1;
    } elsif ($ext eq 'js') {
      $content_type = 'application/javascript; charset=utf-8';
    } elsif ($ext eq 'css') {
      $content_type = 'text/css; charset=utf-8';
    } elsif ($ext eq 'svg') {
      $content_type = 'image/svg+xml; charset=utf-8';
    } elsif ($ext eq 'woff') {
      $content_type = 'application/font-woff';
    } elsif ($ext eq 'ttf') {
      $content_type = 'application/x-font-ttf';
    } elsif ($ext eq 'gif') {
      $content_type = 'image/gif';
    } elsif ($ext eq 'jpg' || $ext eq 'jpeg') {
      $content_type = 'image/jpeg';
    } elsif ($ext eq 'png') {
      $content_type = 'image/png';
    } elsif ($ext eq 'json') {
      $content_type = 'application/json; charset=utf-8';
    } elsif ($ext eq 'webm') {
      $content_type = 'video/webm';
    } elsif ($ext eq 'flv') {
      $content_type = 'video/x-flv';
    } elsif ($ext eq 'pdf') {
      $content_type = 'application/pdf';
    } elsif ($ext eq 'zip') {
      $content_type = 'application/zip';
    } elsif ($ext eq 'ico') {
      $content_type = 'image/x-icon';
    } else {
      $content_type = 'text/plain; charset=utf-8'
    }
  }

  open my $fh, "<:raw", $file or return $self->_web_forbidden;
  my @stat = stat $file;
  Plack::Util::set_io_path($fh, Cwd::realpath($file));

  return [ 200, [
    'Content-Type' => $content_type,
    'Content-Length' => $stat[7],
    'Last-Modified'  => HTTP::Date::time2str( $stat[9] ),
    @headers
  ], $fh ];
}

sub _web_backup {
  my ( $self, $env ) = @_;
  my %values;
  if ($self->demo) {
    %values = defined $env->{'psgix.session'}->{config}
      ? %{$env->{'psgix.session'}->{config}} : ();
  } else {
    return $self->_web_servererror; # TODO
  }
  my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
  return $self->_web_serve_msgpack(\%values,
    'Content-Disposition' => sprintf('attachment;filename=SunRiser8_Backup_%04u%02u%02u_%02u%02u%02u.mp', $year+1900,$mon+1,$mday,$hour,$min,$sec)
  );
}

sub get_state {
  my ( $self, $env ) = @_;
  if ($self->demo) {
    if (!defined $env->{'psgix.session'}->{state}) {
      $env->{'psgix.session'}->{state} = $self->state;
    }
    return $env->{'psgix.session'}->{state};
  } else {
    return $self->state;
  }
}

sub set_pwm {
  my ( $self, $pwm, $val, $env ) = @_;
  if ($self->demo) {
    if (!defined $env->{'psgix.session'}->{state}) {
      $env->{'psgix.session'}->{state} = $self->state;
    }
    $env->{'psgix.session'}->{state}->{pwms}->{$pwm} = $val;
  } else {
    $self->state->{pwms}->{$pwm} = $val;
  }
}

sub _web_state {
  my ( $self, $env ) = @_;
  $self->debug('Sending state');
  my $state = { time => $self->get_time(), uptime => ( $self->get_time() - $self->started() ), %{$self->get_state($env)} };
  #use DDP; p($state);
  return $self->_web_serve_msgpack($state);
}

sub get_time {
  my ( $self ) = @_;
  my $time = time; # gmt timestamp
  my $gmtoff = $self->get('gmtoff');
  return $time + ( $gmtoff * 60 ); # gmtoff
}

sub _web_time {
  my ( $self ) = @_;
  $self->debug('Sending time');
  return $self->_web_serve_msgpack($self->get_time());
}

sub _web_firmware_mp {
  my ( $self, $env ) = @_;
  $self->debug('Sending firmware.mp');
  if ($self->has_systemdb) {
    # $self->cdb->put_replace('___firmware_description',$values{'model'}." v".$version);
    # $self->cdb->put_replace('___firmware_filename',uc($values{'model_id'}.$version));
    # $self->cdb->put_replace('___firmware_experimental',1);
    # $self->cdb->put_replace('___firmware_author',$author);
    # $self->cdb->put_replace('___firmware_timestamp',$utc_time);
    croak "TODO";
  } else {
    my @stat = stat __FILE__;
    return $self->_web_serve_msgpack({
      description => $self->demo ? 'SunRiser Demo' : 'SunRiser Simulator',
      filename => $self->demo ? 'SRDEMO' : 'SRSIMULA',
      experimental => $self->demo ? 0 : 1,
      author => $self->demo ? '<a href="http://LEDaquaristik.de/">LEDaquaristik.de</a>' : 'You',
      timestamp => ( $stat[9] + ( $self->get('gmtoff') * 60 ) ),
      version => ( $self->versioned || '112233445566778899DEMO' ),
    });
  }
}

sub _web_bootload_mp {
  my ( $self, $env ) = @_;
  $self->debug('Sending bootload.mp');
  my @stat = stat __FILE__;
  return $self->_web_serve_msgpack({
    version => 'DEMOSIMULATORBOOTLOADER',
    timestamp => ( $stat[9] + ( $self->get('gmtoff') * 60 ) ),
    mac => [18,52,86,120,154,188]
  });
}

has config => (
  is => 'lazy',
);

sub _build_config {
  my ( $self ) = @_;
  return SunRiser::Config->new;
}

has publisher => (
  is => 'lazy',
  init_arg => undef,
  handles => [qw(
    has_publish_file
    render
  )],
);

sub _build_publisher {
  my ( $self ) = @_;
  return SunRiser::Publisher->new(
    config => $self->config
  );
}

has _mp => (
  is => 'lazy',
  init_arg => undef,
);

sub _build__mp { Data::MessagePack->new->canonical->utf8->prefer_integer }

has web => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_web {
  my ( $self ) = @_;
  croak("Can't start twiggy server on demo, use any PSGI server") if $self->demo;
  $self->info('Starting webserver on port '.$self->port.'...');
  my $server = Twiggy::Server->new(
    port => $self->port,
  );
  $server->register_service($self->psgi);
  return $server;
}

has psgi => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_psgi {
  my ( $self ) = @_;
  builder {
    if ($self->demo) {
      enable 'Session', store => 'File';
    } else { # v ^ still not related
      enable sub {
        my $app = shift;
        sub {
          $self->debug('Web Request '.$_[0]->{REQUEST_METHOD}.' '.$_[0]->{PATH_INFO});
          my $res = $app->($_[0]);
          return $res;
        };
      };
    }
    mount '/' => sub {
      my ( $env ) = @_;
      my $req = Plack::Request->new($env);

      # use DDP; p($env);

      my $method = uc($req->method);
      my $path = $req->path;
      $path =~ s!/+!/!g; # remove double slashes

      # get cookie
      my $cookie = $req->headers->header('Cookie');

      my $logged_in = 1; # real device is also not caring yet
      # checking if cookie contains sid=$anysessionid stored in EPROM
      # if ($cookie && $cookie =~ /sid=$sessionid/) {
      #   $logged_in = 1;
      # }

      # use DDP; p($env->{'psgix.session'});

      if ($path eq '/') {
        # if logged in serve index.html
        if ($logged_in) {
          if ($method eq 'PUT') {
            my $body = $req->raw_body;
            my $data = $self->_mp->unpack($body);
            # use DDP; p($data); 1;
            for my $k (keys %{$data}) {
              $self->debug('Setting key '.$k);
              $self->set($k,$data->{$k},$env);
            }
            return $self->_web_ok;
          } elsif ($method eq 'POST') {
            my $body = $req->raw_body;
            my $data = $self->_mp->unpack($body);
            my %values;
            $self->debug('Requested keys: '.join(',',@{$data}));
            for my $key (@{$data}) {
              $values{$key} = $self->get($key,$env);
            }
            $values{'time'} = $self->get_time();
            # use DDP; p(%values);
            return $self->_web_serve_msgpack(\%values);
          } else {
            return $self->_web_serve_file('index.html');          
          }
        } else {
          # if POST check if body matches password=$password
          if ($method eq 'POST') {
            my $body = $req->raw_body;
            if ($body eq 'password='.$self->password) {
              # Set Cookie to newly generated sessionid from EPROM
              return $self->_web_serve_file('index.html',
                # 'Set-Cookie' => 'sid='.$sessionid
              );
            }
          }
          # if no post or password not accepted, show login.html
          return $self->_web_serve_file('login.html');
        }
      }

      if ($path =~ /^\/logout(.*)$/) {
        # Trick to simulate logout with instead of deleting cookie
        # just garbage it with a wrong session id (safe method)
        return $self->_web_serve_file('login.html',
          'Set-Cookie' => 'sid=x'
        );
      }

      if ($method eq 'GET') {
        my ( $file ) = $path =~ m/^\/(.*)/;

        if ($path =~ /^\/ok/) {
          return $self->_web_ok;
        } elsif ($path =~ /^\/state$/) {
          return $self->_web_state($env);
        } elsif ($path =~ /^\/firmware\.mp$/) {
          return $self->_web_firmware_mp($env);
        } elsif ($path =~ /^\/bootload\.mp$/) {
          return $self->_web_bootload_mp($env);
        } elsif ($path =~ /^\/backup$/) {
          return $self->_web_backup($env);
        } elsif ($path =~ /^\/factorybackup$/) {
          return $self->_web_backup($env);
        }
        # else serve file from storage
        # gives back 200 on success and 404 on not found
        return $self->_web_serve_file($file);
      } elsif ($method eq 'PUT') {
        if ($path =~ /^\/state$/) {
          my $body = $req->raw_body;
          my $data = $self->_mp->unpack($body);
          #use DDP; p($data);
          if (exists $data->{pwms}) {
            for my $pwm (keys %{$data->{pwms}}) {
              #use DDP; p($data->{pwms}->{$pwm}); p($pwm);
              $self->set_pwm($pwm, $data->{pwms}->{$pwm}, $env);
            }
          }
          return $self->_web_ok;
        } elsif ($path =~ /^\/restore$/) {
          my $body = $req->raw_body;
          my $data = $self->_mp->unpack($body);
          # use DDP; p($data); 1;
          for my $k (keys %{$data}) {
            $self->debug('Setting key '.$k);
            $self->set($k,$data->{$k},$env) unless ($self->demo && $k eq 'password');
          }
          return $self->_web_ok;
        } else {
          my $l = length($req->raw_body);
          # use DDP; p($l);
          return $self->_web_ok;
        }
      }

      # can't handle that request, send error
      return $self->_web_servererror;
    };
  };
}

sub BUILD {
  my ( $self ) = @_;
  $self->w;
  $self->started;
}

sub run {
  my ( $self ) = @_;
  croak("Can't run on demo") if $self->demo;
  $self->web;
  $self->cdbs;
  AE::cv->recv;
}

1;

=head1 DESCRIPTION

=head1 SUPPORT

Repository

  http://github.com/LEDaquaristik/sunriser
  Pull request and additional contributors are welcome
 
Issue Tracker

  http://github.com/LEDaquaristik/sunriser/issues

=cut
