#!/usr/bin/env perl

use strict;
use warnings;
use Test::More;
use Path::Tiny;
use SunRiser;
use SunRiser::CDB;
use SunRiser::Config;
use Data::MessagePack;
use Carp qw( croak );

my ( $sr_ip, $sr_firmware ) = @ARGV;

my $path_firmware = path($sr_firmware);

croak "Need IP and Firmware" unless ($sr_ip && -f $path_firmware);

my $cdb = SunRiser::CDB->new( filename => $path_firmware );
my @keys = $cdb->keys;

my $sr = SunRiser->new( host => $sr_ip );
my $firmware = $path_firmware->slurp_raw;
my $fi = $cdb->get_firmware_info;
$fi->{version} = $cdb->get('factory_version');
$fi->{experimental} = Data::MessagePack::false() unless defined $fi->{experimental};
my $rfi = $sr->firmware_info;
is_deeply($fi,$rfi,'Firmware Info matches Bee');
my @config_keys;
for my $k (sort { $a cmp $b } @keys) {
  if ($k =~ m/^web#([\/\w\.]*)#content$/) {
    my $file = $1;
    my $con = $sr->get($file);
    ok($con, 'GET /'.$file.' succeed');
    ok($con eq $cdb->get($k), 'Content of file '.$file.' matches Bee content');
  } elsif ($k =~ m/^web#.*/ || $k =~ m/^___.*/) {
    # ignore 
  } else {
    push @config_keys, $k;
  }
}
my $factory_config = $sr->query(@config_keys);
for my $k (keys %{$factory_config}) {
  next if $k eq 'time';
  is_deeply($factory_config->{$k}, $cdb->get($k), 'Default config key '.$k.' matches Bee content');
}
my $state = $sr->state;
is($state->{pwmloop_stopped}, 0, 'pwmloop is stopped');
for (1..8) {
  is($state->{pwms}->{$_}, 0, 'pwm '.$_.' is zero');
}
ok(defined $state->{uptime} && $state->{uptime} > 0, 'uptime is bigger as 0');
my $gmtoff = $cdb->get('gmtoff') || 0;
my $time = time + ( $gmtoff * 60 );
ok(abs($time - $state->{time}) < 30, 'Clock may be maximum off by 30');
ok($sr->update(%{$factory_config}), 'Update with factory config successful');
my $backup_config = $sr->backup;
is_deeply($backup_config,$factory_config, 'Backup config matches previously fetched factory config');
ok($sr->state({ pwms => { "1" => 123 }}), 'Successful PUT /state request to set pwm 1 to 123');
$state = $sr->state;
is($state->{pwms}->{1},123,'pwm #1 is 123');
ok($sr->state({ pwms => { "1" => 0 }}), 'Successful PUT /state request to set pwm 1 back to 0');
$state = $sr->state;
is($state->{pwms}->{1},0,'pwm 1 is 0');
ok($state->{pwmloop_stopped} != 0,'pwmloop stopped is not 0');

ok(1,'factory.t done');
