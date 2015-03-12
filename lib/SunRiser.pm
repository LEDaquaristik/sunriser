package SunRiser;
# ABSTRACT: LEDaquaristik.de SunRiser Simulator & Builder

use Moo;
use Data::MessagePack;
use LWP::UserAgent;
use HTTP::Request;
use JSON::MaybeXS;
use Carp qw( croak );
use bytes;

our %models = (
  sr8 => {
    model => 'SunRiser 8',
    model_id => 'sr8',
    pwm_count => 8,
  },
);

sub model_info {
  my ( $class, $model ) = @_;
  return $models{$model};
}

has timeout => (
  is => 'lazy',
);

sub _build_timeout {
  return 12;
}

has model => (
  is => 'lazy',
);

sub _build_model {
  return 'sr8';
}

has mp => (
  is => 'lazy',
);

sub _build_mp { Data::MessagePack->new->canonical->utf8 }

has ua => (
  is => 'lazy',
);

sub _build_ua {
  my ( $self ) = @_;
  my $ua = LWP::UserAgent->new;
  $ua->timeout($self->timeout);
  return $ua;
}

has host => (
  is => 'ro',
  required => 1,
);

sub finder {
  my ( $class, $ua ) = @_;
  $ua = LWP::UserAgent->new unless $ua;
  my $res = $ua->request(HTTP::Request->new( 'GET', 'http://sunriser.ledaquaristik.de/finder/' ));
  return $res->is_success ? decode_json($res->content) : undef;
}

sub call_mp {
  my ( $self, $method, $path, @data ) = @_;
  my $req = scalar @data ? $self->mp_request($method, $path, $data[0]) : $self->request($method, $path);
  my $res = $self->ua->request($req);
  return $res;
}

sub res_mp_body {
  my ( $self, $res ) = @_;
  return unless $res->is_success;
  return $self->mp->unpack($res->content);
}

sub call {
  my ( $self, $method, $path, $data ) = @_;
  my $req = $self->request($method, $path, $data);
  my $res = $self->ua->request($req);
  #use DDP; p($res);
  return $res;
}

sub request {
  my ( $self, $method, $path, $data ) = @_;
  return HTTP::Request->new( $method, 'http://'.($self->host).'/'.$path, [], $data );
}

sub mp_request {
  my ( $self, $method, $path, $data ) = @_;
  return HTTP::Request->new( $method, 'http://'.($self->host).'/'.$path, [], $self->mp->pack($data) );
}

sub firmware_info {
  my ( $self ) = @_;
  return $self->res_mp_body($self->call('GET', 'firmware.mp'));
}

sub update_firmware {
  my ( $self, $firmware ) = @_;
  croak "Doesn't look like a firmware with this size" unless length($firmware) > 50_000;
  return $self->call('PUT', 'firmware', $firmware);
}

sub update_factory {
  my ( $self, $factory ) = @_;
  croak "Doesn't look like a firmware with this size" unless length($factory) > 50_000;
  return $self->call('PUT', 'factory', $factory);
}

sub bootloader_info {
  my ( $self ) = @_;
  return $self->res_mp_body($self->call('GET', 'bootload.mp'));
}

sub backup {
  my ( $self ) = @_;
  return $self->res_mp_body($self->call('GET', 'backup'));
}

sub reboot {
  my ( $self ) = @_;
  return $self->call('GET', 'reboot')->is_success;
}

sub ok {
  my ( $self ) = @_;
  return $self->call('GET', 'ok')->is_success;
}

sub restore {
  my ( $self, $restore ) = @_;
  return $self->call('PUT', 'restore', $restore)->is_success;
}

sub state {
  my ( $self, @args ) = @_;
  croak __PACKAGE__."->state too many args" if scalar @args > 1;
  my $state = $args[0];
  my $res = $self->call_mp($state ? 'PUT' : 'GET', 'state', $state ? ($state) : ());
  return $state ? $res->is_success : $self->res_mp_body($res);
}

sub get {
  my ( $self, $path ) = @_;
  my $res = $self->call('GET', $path);
  return undef unless $res->is_success;
  return $res->content;
}

sub query {
  my ( $self, @keys ) = @_;
  return $self->res_mp_body($self->call_mp('POST', '', [ @keys ]));
}

sub update {
  my ( $self, %data ) = @_;
  return $self->call_mp('PUT', '', { %data })->is_success;
}

sub wait_for {
  my ( $self ) = @_;
  my $i = 0;
  while (1) {
    $i++;
    last if $self->ok;
    return undef if $i > 60;
  }
  return $i;
}

1;

=head1 DESCRIPTION

=head1 SUPPORT

Repository

  http://github.com/LEDaquaristik/sunriser
  Pull request and additional contributors are welcome
 
Issue Tracker

  http://github.com/LEDaquaristik/sunriser/issues

=cut
