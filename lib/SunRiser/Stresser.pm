package SunRiser::Stresser;

use MooX qw(
  Options
);
use LWP::UserAgent;
use HTTP::Request::Common;
use JSON::MaybeXS;
use File::ShareDir::ProjectDistDir;
use Carp qw( croak );
use Path::Tiny;

option powercmd => (
  is => 'ro',
  format => 's',
  lazy => 1,
  required => 1,
  doc => 'Command to execute to power cycle SunRiser',
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
  $ua->timeout(5);
  return $ua;
}

sub run {
  my ( $self ) = @_;
  print "Power cycle SunRiser...\n";
  system($self->powercmd);
  while (1) { $self->run_loop }
}

sub run_loop {
  my ( $self ) = @_;
  my $success;
  print "Clearing finder memory";
  until ($success) {
    print ".";
    $success = $self->ua->request(GET($self->finder.'?clear=1'))->is_success;
    sleep(1);
  }
  print "\n";
  print "Waiting for SunRiser";
  my $i = 0;
  while (1) {
    $i++;
    my $req = GET($self->finder);
    print ".";
    my $res = $self->ua->request($req);
    if ($res->is_success) {
      my $data = decode_json($res->content);
      my @keys = keys %{$data};
      croak "Too many SunRiser on the finder..." if scalar @keys > 1;
      for my $mac (@keys) {
        print " found after ".$i." seconds!\n";
        my $ip = $data->{$mac}->{ip};
        print "Trying to reach SunRiser at ".$ip;
        my $reach;
        until ($reach) {
          print ".";
          $reach = $self->ua->request(GET('http://'.$ip.'/'))->is_success;
          sleep(1);
        }
        print " success!\n";
        print "Power cycle SunRiser...\n";
        system($self->powercmd);
        print "Waiting 5 sec...\n";
        sleep(5);
        return;
      }
    }
    sleep(1);
  }
}

1;
