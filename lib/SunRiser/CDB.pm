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

sub create_factory {
  my ( $self, $filename, $publisher, %other ) = @_;
  my $keys = 0;
  my $config = $publisher->config;
  my $share = path(defined $other{share}
    ? (delete $other{share}) : (dist_dir('SunRiser'),'web'));
  my %values = ( %{$config->values}, %other );
  $values{factory} = 1;
  $values{factory_model} = 'SunRiser 8';
  my $mp = Data::MessagePack->new();
  $mp->canonical->prefer_integer;
  $self->info('Creating CDB '.$filename);
  my $cdb = CDB::TinyCDB->create($filename,$filename.".$$");
  for my $k (sort { $a cmp $b } keys %values) {
    my $type = $config->type($k);
    $self->debug('Adding key '.$k.' ('.$type.') with value '.$values{$k});
    $keys++;
    $cdb->put_replace($k,_msgpack($type,$values{$k}));
  }
  for my $publisher_file (@{$publisher->publish_files}) {
    $keys++;
    $self->_add_web($cdb,$publisher_file,$publisher->render($publisher_file));
  }
  my $iter = $share->iterator({ recurse => 1 });
  while(my $share_file = $iter->()) {
    next unless $share_file->is_file;
    my $file = $share_file->relative($share)->stringify;
    $keys++;
    $self->_add_web($cdb,$file,scalar $share_file->slurp_raw);
  }
  $self->info('Finish CDB with '.$keys.' keys');
  $cdb->finish;
  return 1;
}

sub _msgpack {
  my ( $type, $data ) = @_;
  return Data::MessagePack->pack(undef) if !defined $data;
  if ($type eq 'bool') {
    my $h = unpack('H*',Data::MessagePack->pack(
      $data
        ? Data::MessagePack::true()
        : Data::MessagePack::false()
    ));
    return Data::MessagePack->pack(
      $data
        ? Data::MessagePack::true()
        : Data::MessagePack::false()
    );
  } elsif ($type eq 'unsigned') {
    return Data::MessagePack->pack(0 + $data);
  } elsif ($type eq 'signed') {
    return _msgpack_signed($data);
  } elsif ($type eq 'text') {
    return Data::MessagePack->pack("$data");
  } else {
    return Data::MessagePack->pack($data);
  }
}

sub _msgpack_signed {
  my ( $num ) = @_;
  my $abs = abs($num);
  return $abs <= 32 ?   pack 'C', ($num & 255)
    : $abs <= 2 **  7 ? pack 'Cc', 0xd0, $num
    : $abs <= 2 ** 15 ? pack 'Cn', 0xd1, $num
    : $abs <= 2 ** 31 ? pack 'CN', 0xd2, $num
    : croak("can't handle the absolute value of %d as signed",$abs);
}

sub _add_web {
  my ( $self, $cdb, $f, $content ) = @_;
  my $base_key = 'web#'.$f;
  my $length = length($content);
  my $base_debug = 'Adding '.$f.' with '.$length.' bytes';
  if ($length > 256) {
    $self->debug($base_debug.' (gzipped)');
    my $gzipped;
    gzip(\$content,\$gzipped) or croak("gzip failed: $GzipError");
    $cdb->put_replace($base_key.'#bytes',_msgpack('unsigned',$length));
    $cdb->put_replace($base_key.'#gzip',_msgpack('bool',1));
    $cdb->put_replace($base_key.'#content',_msgpack('binary',$gzipped));
  } else {
    $self->debug($base_debug);
    $cdb->put_replace($base_key.'#content',_msgpack('binary',$content));
  }
}

1;