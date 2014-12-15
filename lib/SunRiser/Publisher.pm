package SunRiser::Publisher;
# ABSTRACT: SunRiser static file generation

use Moo;

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_PUBLISHER' }

use Text::Xslate qw( mark_raw );
use Path::Tiny;
use File::ShareDir::ProjectDistDir;
use SunRiser::Config;
use JSON::MaybeXS;
use Carp qw( croak );

has config => (
  is => 'lazy',
);

sub _build_config {
  my ( $self ) = @_;
  return SunRiser::Config->new;
}

has publish_files => (
  is => 'lazy',
);

sub _build_publish_files {
  my ( $self ) = @_;
  return [qw(

    clouds.html
    contact.html
    day.html
    help.html
    index.html
    intro.html
    sysinfo.html
    led.html
    licenses.html
    login.html
    moon.html
    network.html
    password.html
    rain.html
    system.html
    thunderstorm.html

    notfound.html

    sr_config_def.json

  )];
}

sub has_publish_file {
  my ( $self, $file ) = @_;
  my %files = ( map { $_, 1 } @{$self->publish_files} );
  return defined $files{$file};
}

sub publish_to {
  my ( $self, $dir ) = @_;
  $self->info('Publishing all files to '.$dir);
  my @files = @{$self->publish_files};
  for my $filename (@files) {
    my $file = path($dir,$filename);
    $file->parent->mkpath unless -d $file->parent;
    $file->spew_utf8($self->render($filename));
  }
}

sub render {
  my ( $self, $file ) = @_;
  my @parts = split('\.',$file);
  my $ext = pop @parts;
  my $filename = pop @parts;
  if ($ext eq 'html') {
    $self->info('Generating '.$file.' from template');
    my $template = $file.'.tx';
    my %vars = %{$self->base_vars};
    $vars{file} = $file;
    return $self->template_engine->render($template,\%vars);    
  } elsif ($ext eq 'json') {
    my $func = 'json_'.$filename;
    $self->info('Generating '.$file.' from function '.$func);
    return encode_json($self->$func());
  }
  croak "Don't know how to render ".$ext;
}

########################################################################

sub json_sr_config_def {
  my ( $self ) = @_;
  my @keys = keys %{$self->config->types};
  return {map {
    $_, {
      type => $self->config->types->{$_},
      defined $self->config->defaults->{$_}
        ? ( default => $self->config->defaults->{$_} ) : (),
    };
  } @keys};
}

########################################################################

has base_vars => (
  is => 'lazy',
);

sub _build_base_vars {
  my ( $self ) = @_;
  return {
    pwm_count => 8,
  };
}

has template_path => (
  is => 'lazy',
);

sub _build_template_path {
  path(dist_dir('SunRiser'),'templates')->absolute->stringify
}

has template_engine => (
  is => 'lazy',
);

sub _build_template_engine {
  my ( $self ) = @_;
  my $templates = $self->template_path;
  return Text::Xslate->new(
    path => [$templates],
    function => {
      r => sub { return mark_raw(join("",@_)) },
      substr => sub {
        my($str, $offset, $length) = @_;
        return undef unless defined $str;
        $offset = 0 unless defined $offset;
        $length = length($str) unless defined $length;
        return CORE::substr($str, $offset, $length);
      },
      lc => sub {
        return defined($_[0]) ? CORE::lc($_[0]) : undef;
      },
      uc => sub {
        return defined($_[0]) ? CORE::uc($_[0]) : undef;
      },
    },
  );
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
