package SunRiser::Finder;
# ABSTRACT: SunRiser Finder application class

use MooX qw(
  Options
);

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_FINDER' }

use AnyEvent;
use Twiggy::Server;
use Plack::Builder;
use JSON::MaybeXS;
use Plack::Request;
use bytes;
use Carp qw( croak );

option port => (
  is => 'ro',
  format => 'i',
  lazy => 1,
  default => sub { 7780 },
  doc => 'port for finder webserver',
);

has ips => (
  is => 'lazy',
  init_arg => undef,
  default => sub {{}},
);

has web => (
  is => 'lazy',
  init_arg => undef,
);

sub _build_web {
  my ( $self ) = @_;
  $self->info('Starting SunRiser Finder Server on port '.$self->port.'...');
  my $server = Twiggy::Server->new(
    port => $self->port,
  );
  $server->register_service(builder {
    enable sub {
      my $app = shift;
      sub {
        $self->debug('Web Request '.$_[0]->{REQUEST_METHOD}.' '.$_[0]->{PATH_INFO});
        my $res = $app->($_[0]);
        return $res;
      };
    };
    mount '/' => sub {
      my ( $env ) = @_;
      my $req = Plack::Request->new($env);
      my $ip = $req->header('X-Real-IP') || $req->address;
      my $clear = $req->parameters->{clear};
      if ($clear) {
        $self->ips->{$ip} = {};
        return [ 200, [
          "Content-Type" => "text/plain",
          $req->method eq 'HEAD' ? () : ( "Content-Length" => 2 ),
          "Access-Control-Allow-Origin" => "*",
        ], [ $req->method eq 'HEAD' ? () : ("OK") ] ];
      } else {
        my $sr_ip = $req->header('X-SR-Finder-IP');
        my $sr_hostname = $req->header('X-SR-Finder-Hostname');
        my $sr_firmware = $req->header('X-SR-Finder-Firmware');
        my $sr_firmware_timestamp = $req->header('X-SR-Finder-Firmware-Timestamp');
        my $sr_mac = $req->header('X-SR-Finder-MAC');
        if ($sr_ip) {
          $self->ips->{$ip} = {} unless defined $self->ips->{$ip};
          $self->ips->{$ip}->{$sr_mac} = {
            ip => $sr_ip,
            hostname => $sr_hostname,
            firmware_filename => $sr_firmware,
            firmware_timestamp => $sr_firmware_timestamp+0
          };
        }
        my $json = encode_json(defined $self->ips->{$ip} ? $self->ips->{$ip} : {});
        return [ 200, [
          "Content-Type" => "application/json",
          $req->method eq 'HEAD' ? () : ( "Content-Length" => length($json) ),
          "Access-Control-Allow-Origin" => "*",
        ], [ $req->method eq 'HEAD' ? () : ($json) ] ];
      }
    };
  });
  return $server;
}

sub BUILD {
  my ( $self ) = @_;
  $self->web;
}

sub run {
  AE::cv->recv;
}

1;

=head1 DESCRIPTION

=head1 SUPPORT

Repository

  https://github.com/LEDaquaristik/sunriser
  Pull request and additional contributors are welcome

Issue Tracker

  https://github.com/LEDaquaristik/sunriser/issues

=cut
