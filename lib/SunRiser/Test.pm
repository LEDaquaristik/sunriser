package SunRiser::Test;

use Moo;
use Test::More;
use Path::Tiny;
use File::ShareDir::ProjectDistDir;
use Plack::Test::Agent;
use Plack::App::Proxy;

has sim => (
  is => 'ro',
  predicate => 1,
);

has remote => (
  is => 'ro',
);

has app => (
  is => 'lazy',
);

sub _build_app {
  my ( $self ) = @_;
  return $self->sim->psgi if $self->has_sim;
  return Plack::App::Proxy->new( remote => $self->remote )->to_app;
}

has t => (
  is => 'lazy',
);

sub _build_t {
  my ( $self ) = @_;
  return Plack::Test::Agent->new(
    app => $self->app,
    host => 'sunriser',
    port => 80,
  );
}

has pub => (
  is => 'lazy',
);

sub _build_pub {
  my ( $self ) = @_;
  return $self->sim->publisher;
}

sub base_test {
  my ( $self ) = @_;
  $self->test_root;
  $self->test_publish_files;
  $self->test_share;
}

sub test_root {
  my ( $self, $index_html ) = @_;
  $index_html = 'index.html' unless defined $index_html;
  my $res = $self->t->get('/');
  ok($res->is_success,'GET / succeed');
  # is($self->get_content($res),$self->pub->render($index_html),'Content of / matches content of '.$index_html);  
}

sub get_content {
  my ( $self, $res ) = @_;
  if ($res->content_encoding('gzip')) {
    return Compress::Zlib::memGunzip($res->content);
  } else {
    return $res->content;
  }
}

sub test_publish_files {
  my ( $self ) = @_;
  for my $file (@{$self->pub->publish_files}) {
    my $res = $self->t->get($file);
    ok($res->is_success,'GET /'.$file.' succeed');
    # is($self->get_content($res),$self->pub->render($file),'Content of /'.$file.' matches render content');      
  }
}

sub test_share {
  my ( $self ) = @_;
  my $share = path(dist_dir('SunRiser'),'web');
  my $iter = $share->iterator({ recurse => 1 });
  while(my $share_file = $iter->()) {
    next unless $share_file->is_file;
    my $file = $share_file->relative($share)->stringify;
    if ($self->pub->versioned) {
      next if $file =~ /^css\//;
      next if $file =~ /^js\//;      
    }
    my $res = $self->t->get($file);
    ok($res->is_success,'GET /'.$file.' succeed');
    # is($self->get_content($res),scalar $share_file->slurp_raw,'Content of /'.$file.' matches share dir content');
  }
}

1;