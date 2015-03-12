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
use Test::Tester;
use SunRiser::Test;
use File::ShareDir::ProjectDistDir;
use Carp qw( croak );
use Path::Tiny;
use Term::ReadKey;

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
          print "Testing ".$ip.": ";
          my $sr = SunRiser->new( host => $ip );
          if ($sr->ok) {
            print "ok\n";
            my $tfi = $sr->firmware_info;
            if (!$tfi || $tfi->{filename} ne $fi->{filename} || $tfi->{timestamp} != $fi->{timestamp}) {
              print "Install tester firmware as factory... ";
              if ($sr->update_factory($firmware)) {
                print "OK\n";
              } else {
                print "FAILED!!!\n";
              }
            } else {
              print "Already installed tester firmware.. rebooting\n";
              $sr->reboot;
            }
            print "Waiting for SunRiser... ";
            print "waited ".$sr->wait_for." seconds\n";

            my $test = path(dist_dir('SunRiser'),'tests','factory.t')->slurp;
            my $try = 0;
            my $all_ok = 0;

            while (!$all_ok) {
              my $time = time;

              $try++;

              print "Factory test try ".$try."... ";

              my ($premature, @results) = run_tests(sub {
                {
                  @ARGV = ( $ip, $self->firmware );
                  eval 'package SunRiserTester'.$time.";\n".$test;
                  croak $@ if $@;
                }
              });

              my %failed;
              my $last;
              my $i = 0;
              for (@results) {
                if ($_->{ok}) {
                  if ($try > 1) {
                    delete $failed{$i} if exists $failed{$i};
                  }
                } else {
                  if ($try == 1) {
                    $failed{$i} = $_->{name};
                  }
                }
                $last = $_;
                $i++;
              }
              print %failed ? 'Failed' : 'OK', "\n";

              if ($last->{name} ne 'factory.t done') {
                print "Did not reached last test\n";
              } elsif (%failed) {
                print "We got ".(scalar keys %failed)." failing tests:\n";
                for (keys %failed) {
                  print " - ".$failed{$_}."\n";
                }
                print "Rebooting... ";
                $sr->reboot; $sr->wait_for;
                print "done\n";
              } else {
                $all_ok = 1;
              }

              croak "Failed too often!" if $try > 9;
            }

            print "Reinstall tester firmware for resetting... ";
            if ($sr->update_factory($firmware)) {
              print "OK\n";
            } else {
              print "FAILED!!!\n";
            }

            print "Waiting for SunRiser... ";
            print "waited ".$sr->wait_for." seconds\n";

            print "Testing LED.... Press key to continue... ";
            ReadMode(3);
            while(1) {
              my $key;
              for (1..8,reverse(1..7)) {
                $sr->state({ pwms => { "".$_ => 1000 }});
                for (1..100000) {
                  $key = ReadKey(-1);
                  last if $key;
                }
                last if $key;
                $sr->state({ pwms => { "".$_ => 0 }});
              }
              last if $key;
              for (1..500000) {
                $key = ReadKey(-1);
                last if $key;
              }
            }
            print "done\n";

            $sr->state({ pwms => { map { "".$_ => 0 } 1..8 }});

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