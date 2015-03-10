package SunRiser;
# ABSTRACT: LEDaquaristik.de SunRiser Simulator & Builder

use Moo;
use Data::MessagePack;
use LWP::UserAgent;
use HTTP::Request;

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

has model => (
  is => 'lazy',
);

sub _build_model {
  my ( $self ) = @_;
  return 'sr8';
}

has mp => (
  is => 'lazy',
);

sub _build_mp { Data::MessagePack->new->canonical->utf8->prefer_integer }

has ua => (
  is => 'lazy',
);

sub _build_ua {
  my ( $self ) = @_;
  my $ua = LWP::UserAgent->new;
  $ua->timeout(3);
  return $ua;
}

has host => (
  is => 'ro',
  required => 1,
);

sub call_mp {
  my ( $self, $method, $path, $data ) = @_;
  my $req = $self->mp_request($method, $path, $data);
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
  return $self->res_mp_body($self->call_mp('GET','firmware.mp'));
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
