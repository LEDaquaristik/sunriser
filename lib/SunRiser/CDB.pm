package SunRiser::CDB;
# ABSTRACT: SunRiser CDB

use Moo;

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_CDB' }

use Path::Tiny;
use IO::Compress::Gzip;
use bytes;
use CDB::TinyCDB;
use Data::MessagePack;
use IO::Compress::Gzip qw( gzip $GzipError );
use Carp qw( croak );
use File::ShareDir::ProjectDistDir;

has config => (
  is => 'ro',
  required => 1,
);

has filename => (
  is => 'ro',
  required => 1,
);

has readonly => (
  is => 'lazy',
);

sub _build_readonly { 0 }

has cdb => (
  is => 'rw',
  lazy => 1,
  builder => 1,
  init_arg => undef,
  handles => [qw( keys )],
);

sub _build_cdb {
  my ( $self ) = @_;
  return -f $self->filename
    ? CDB::TinyCDB->open($self->filename, for_update => $self->filename.".$$")
    : $self->readonly
      ? croak("Can't open non-existing readonly database ".$self->filename)
      : CDB::TinyCDB->create($self->filename,$self->filename.".$$");
}

has _mp => (
  is => 'lazy',
  init_arg => undef,
);

sub _build__mp { Data::MessagePack->new->canonical->utf8->prefer_integer }

sub BUILD {
  my ( $self ) = @_;
  $self->cdb;
}

##### Package Methods

sub set {
  my ( $self, $key, $value ) = @_;
  croak("Trying to set on readonly CDB ".$self->filename) if $self->readonly;
  my $type = $self->config->type($key);
  $self->debug('Setting key '.$key.' ('.$type.')');
  $self->cdb->put_replace($key,$self->msgpack($type,$value));
}

sub get {
  my ( $self, $key ) = @_;
  return undef unless $self->cdb->exists($key);
  my $msgpack = $self->cdb->get($key);
  return $self->_mp->unpack($msgpack);
}

sub exists {
  my ( $self, $key ) = @_;
  return 0 unless $self->cdb->exists($key);
  my $msgpack = $self->cdb->get($key);
  my $value = $self->_mp->unpack($msgpack);
  return defined $value ? 1 : 0;
}

sub save {
  my ( $self ) = @_;
  croak("Trying to save readonly CDB ".$self->filename) if $self->readonly;
  $self->cdb->finish( save_changes => 1, reopen => 1 );
  # Bug in CDB::TinyCDB?
  $self->cdb(undef);
  $self->cdb($self->_build_cdb);
  return 1;
}

sub add_factory {
  my ( $self, $publisher, %other ) = @_;
  my %values = ( %{$self->config->get_defaults}, %other );
  $self->set('factory',1);
  # Add values
  for my $k (sort { $a cmp $b } keys %values) {
    $self->set($k,$values{$k});
  }
  # Add published files
  for my $publisher_file (@{$publisher->publish_files}) {
    $self->add_web($publisher_file,$publisher->render($publisher_file));
  }
  # Add share files
  my $share = path(defined $other{share}
    ? (delete $other{share})
    : (dist_dir('SunRiser'),'web'));
  my $iter = $share->iterator({ recurse => 1 });
  while(my $share_file = $iter->()) {
    next unless $share_file->is_file;
    my $file = $share_file->relative($share)->stringify;
    if ($publisher->versioned) {
      next if $file =~ /^css\//;
      next if $file =~ /^js\//;      
    }
    $self->add_web($file,scalar $share_file->slurp_raw);
  }
  # Add version if versioned
  if ($publisher->versioned) {
    $self->set('factory_version',$publisher->versioned);
    my $version = "".$publisher->versioned."";
    $self->cdb->put_replace('___firmware_description',$values{'model'}." v".$version);
    $version =~ s/[^\d]//g;
    $self->cdb->put_replace('___firmware_filename',uc($values{'model_id'}.$version));
  } else {
    my $gitv = `git rev-parse HEAD`;
    chomp($gitv);
    $self->cdb->put_replace('___firmware_description',$values{'model'}." ".$gitv);
    $self->cdb->put_replace('___firmware_filename',uc(substr($gitv,0,8)));
  }
  # Additional raw firmware information
  my $author = $ENV{SUNRISER_FACTORY_AUTHOR};
  unless ($author) {
    my $username = `git config --get user.name`;
    chomp($username);
    my $email = `git config --get user.email`;
    chomp($email);
    $author = $username.' <'.$email.'>';
  }
  $self->cdb->put_replace('___firmware_author',$author);
  # Adding firmware if main.bin exist
  my $main = path('main.bin');
  if (-f $main) {
    $self->debug('Adding raw ___firmware');
    $self->cdb->put_replace('___firmware',scalar $main->slurp_raw);
  }
  return 1;
}

sub msgpack {
  my ( $self, $type, $data ) = @_;
  return $self->_mp->pack(undef) if !defined $data;
  if ($type eq 'bool') {
    return $self->_mp->pack(
      $data
        ? Data::MessagePack::true()
        : Data::MessagePack::false()
    );
  } elsif ($type eq 'integer') {
    return $self->_mp->pack(0 + $data);
  } elsif ($type eq 'text') {
    return $self->_mp->pack("$data");
  } else {
    return $self->_mp->pack($data);
  }
}

sub add_web {
  my ( $self, $f, $content ) = @_;
  my $base_key = 'web#'.$f;
  my $length = length($content);
  my $base_debug = 'Adding '.$f.' with '.$length.' bytes';
  if ($length > 256) {
    $self->debug($base_debug.' (gzipped)');
    my $gzipped;
    gzip(\$content,\$gzipped) or croak("gzip failed: $GzipError");
    $self->set($base_key.'#bytes',$length);
    $self->set($base_key.'#gzip',1);
    $self->set($base_key.'#content',$gzipped);
  } else {
    $self->debug($base_debug);
    $self->set($base_key.'#gzip',0);
    $self->set($base_key.'#content',$content);
  }
  $self->set($base_key.'#deleted',0);
}

1;