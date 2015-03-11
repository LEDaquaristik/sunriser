package SunRiser::Test;

use Moo;
use Test::More;
use Path::Tiny;
use File::ShareDir::ProjectDistDir;
use Plack::Test::Agent;
use Plack::App::Proxy;
use DDP;

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
  return Plack::App::Proxy->new( remote => $self->remote, backend => 'LWP', options => { timeout => 5 } )->to_app;
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
  }
}

sub factory_test {

}

  # pwm#1#color            "",
  # pwm#1#manager          0,
  # pwm#2#color            "",
  # pwm#2#manager          0,
  # pwm#3#color            "",
  # pwm#3#manager          0,
  # pwm#4#color            "",
  # pwm#4#manager          0,
  # pwm#5#color            "",
  # pwm#5#manager          0,
  # pwm#6#color            "",
  # pwm#6#manager          0,
  # pwm#7#color            "",
  # pwm#7#manager          0,
  # pwm#8#color            "",
  # pwm#8#manager          0,
  # weather#setup#0#pwms   []

1;