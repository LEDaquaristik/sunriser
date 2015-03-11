package SunRiser::Tester;

use MooX qw(
  Options
);
use LWP::UserAgent;
use HTTP::Request::Common;
use JSON::MaybeXS;
use SunRiser;
use SunRiser::CDB;
use SunRiser::Config;
use SunRiser::Test;
use Carp qw( croak );
use Path::Tiny;

option firmware => (
  is => 'ro',
  format => 's',
  required => 1,
);

option finder => (
  is => 'ro',
  format => 's',
  lazy => 1,
  default => sub { 'http://sunriser.ledaquaristik.de/finder' },
  doc => 'SunRiser Finder URL to use',
);

has ua => (
  is => 'lazy',
);

sub _build_ua {
  my ( $self ) = @_;
  my $ua = LWP::UserAgent->new;
  $ua->timeout(20);
  return $ua;
}

has tested => (
  is => 'lazy',
  default => sub {{}},
);

has firmware_cdb => (
  is => 'lazy',
);

sub _build_firmware_cdb {
  my ( $self ) = @_;
  return SunRiser::CDB->new(
    filename => $self->firmware, config => SunRiser::Config->new,
  );
}

has firmware_info => (
  is => 'lazy',
);

sub _build_firmware_info {
  my ( $self ) = @_;
  return $self->firmware_cdb->get_firmware_info;
}

sub run {
  my ( $self ) = @_;
  my $fi = $self->firmware_info;
  my $factory_version = $self->firmware_cdb->get('factory_version');
  my $firmware = scalar path($self->firmware)->slurp_raw;
  while (1) {
    my $req = GET($self->finder);
    my $res = $self->ua->request($req);
    if ($res->is_success) {
      my $data = decode_json($res->content);
      for my $mac (keys %{$data}) {
        if (!defined $self->tested->{$mac}) {
          $self->tested->{$mac} = 1;
          my $ip = $data->{$mac}->{ip};
          print "Testing ".$ip.":\n";
          my $sr = SunRiser->new( host => $ip );
          my $ok = $sr->call('GET','ok');
          if ($ok->is_success) {
            my $tfi = $sr->firmware_info;
            my $fares;
            my $max = 50;
            my $min = 2;
            if (!$tfi || $tfi->{filename} ne $fi->{filename} || $tfi->{timestamp} != $fi->{timestamp}) {
              print "Install tester firmware as factory... ";
              $fares = $sr->call('PUT','factory',$firmware);
            } else {
              print "Already installed tester firmware\n";
              $fares = $sr->call('GET','reboot');
              $max = 20;
            }
            if ($fares->is_success) {
              print "success!\n";
              print "Waiting for SunRiser being back again...";
              my $i = 0;
              while (1) {
                $i++;
                my $res = $sr->call('GET','ok');
                print ".";
                if ($res->is_success) {
                  last;
                }
                if ($i > $max) {
                  print "FAILURE!\n";
                  exit 1;
                }
              }
              print " (".$i." seconds)\n";
              if ($i < $min) {
                print "Factory installation must have failed, too short timeframe\n";
                exit 1;
              }
            } else {
              print "FAILURE!\n";
              exit 1;
            }

            my $try = 0;
            my $success = 0;

            my $test = SunRiser::Test->new( remote => 'http://'.$ip.'/' );
            while (!$success) {
              $try++;
              my $start = time;
              $success = $test->factory_test($self->firmware_cdb,$sr);
              my $diff = time - $start;
              print "\nTests took: ".$diff." seconds [#".$try."]\n\n";
              if ($try == 5) {
                croak "Tests failed too often";
              }
            }

          } else {
            print "unreachable... Ignoring\n";
          }
        }
      }
    }
  }
  exit 0;
}

1;