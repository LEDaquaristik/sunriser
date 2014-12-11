package SunRiser::CDB;
# ABSTRACT: SunRiser CDB

use Moo;

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_CDB' }

use Path::Tiny;
use IO::Compress::Gzip;
use bytes;
use CDB::TinyCDB;
use IO::Compress::Gzip qw( gzip $GzipError );
use Carp qw( croak );
use File::ShareDir::ProjectDistDir;

sub create_factory {
  my ( $self, $filename, $publisher, %other ) = @_;
  my $config = $publisher->config;
  my $share = path(defined $other{share}
    ? (delete $other{share}) : (dist_dir('SunRiser'),'web'));
  my %values = ( %{$config->values}, %other );
  $values{factory} = 1;
  $values{factory_model} = 'SunRiser 8';
  $self->info('Creating CDB '.$filename);
  my $cdb = CDB::TinyCDB->create($filename,$filename.".$$");
  for my $k (keys %values) {
    $self->debug('Adding key '.$k.' with value '.$values{$k});
    $cdb->put_replace($k,$values{$k});
  }
  for my $publisher_file (@{$publisher->publish_files}) {
    $self->_add_web($cdb,$publisher_file,$publisher->render($publisher_file));
  }
  my $iter = $share->iterator({ recurse => 1 });
  while(my $share_file = $iter->()) {
    next unless $share_file->is_file;
    my $file = $share_file->relative($share)->stringify;
    $self->_add_web($cdb,$file,scalar $share_file->slurp_raw);
  }
  $self->info('Finish CDB');
  $cdb->finish;
  return 1;
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
    $cdb->put_replace($base_key.'#bytes',$length);
    $cdb->put_replace($base_key.'#gzip',1);
    $cdb->put_replace($base_key.'#content',$gzipped);
  } else {
    $self->debug($base_debug);
    $cdb->put_replace($base_key.'#content',$content);    
  }
}

1;