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
  my ( $self, $cdb, $sr ) = @_;
  my $t = $self->t;
  my @keys = $cdb->keys;
  my $fi = $cdb->get_firmware_info;
  $fi->{version} = $cdb->get('factory_version');
  $fi->{experimental} = Data::MessagePack::false() unless defined $fi->{experimental};
  my $rfi = $sr->res_mp_body($sr->call('GET','firmware.mp'));
  is_deeply($fi,$rfi,'Firmware Info matches Bee');
  my @config_keys;
  for my $k (sort { $a cmp $b } @keys) {
    if ($k =~ m/^web#([\/\w\.]*)#content$/) {
      my $file = $1;
      my $res = $t->get($file);
      ok($res->is_success,'GET /'.$file.' succeed');
      is($res->content,$cdb->get($k),'Content of file '.$file.' matches Bee content');
    } elsif ($k =~ m/^web#.*/ || $k =~ m/^___.*/) {
      # ignore 
    } else {
      push @config_keys, $k;
    }
  }
  my $conf_res = $sr->call_mp('POST','',[@config_keys]);
  ok($conf_res->is_success,'Successful POST / request for config keys');
  my $factory_config = $sr->res_mp_body($conf_res);
  for my $k (keys %{$factory_config}) {
    next if $k eq 'time';
    is_deeply($factory_config->{$k},$cdb->get($k),'Default config key '.$k.' matches Bee content');
  }
  my $save_res = $sr->call_mp('PUT','',$factory_config);
  ok($save_res->is_success,'Successful PUT / request for factory config');
  my $backup_res = $sr->call('GET','backup');
  ok($backup_res->is_success,'Successful GET /backup request for factory config backup');
  my $backup_config = $sr->res_mp_body($backup_res);
  is_deeply($backup_config,$factory_config,'Backup config matches previously fetched factory config');
  my $state_res = $sr->call('GET','state');
  ok($state_res->is_success,'Successful GET /state request');
  my $state = $sr->res_mp_body($state_res);
  is($state->{pwmloop_stopped},0,'pwmloop is stopped');
  for (1..8) {
    is($state->{pwms}->{$_},0,'pwm #'.$_.' is zero');
  }
  ok($state->{uptime} > 0,'uptime is bigger as 0');
  my $gmtoff = $cdb->get('gmtoff') || 0;
  my $time = time + ( $gmtoff * 60 );
  ok(abs($time - $state->{time}) < 30,'Clock may be maximum off by 30');
  my $set_res = $sr->call_mp('PUT','state',{ pwms => { "1" => 123 }});
  ok($set_res->is_success,'Successful PUT /state request');
  $state_res = $sr->call('GET','state');
  ok($state_res->is_success,'Successful GET /state request');
  $state = $sr->res_mp_body($state_res);
  is($state->{pwms}->{1},123,'pwm #1 is 123');
  print "Factory test done...\n";
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