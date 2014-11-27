package SunRiser::Config;
# ABSTRACT: SunRiser Config Management

use Moo;

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_CONFIG' }

use JSON::MaybeXS;
use Path::Tiny;
use File::ShareDir::ProjectDistDir;

has values => (
  is => 'ro',
  lazy => 1,
  init_arg => undef,
);

sub _build_values {
  my ( $self ) = @_;
  return {} unless $self->has_init_values;
}

has init_values => (
  is => 'ro',
  predicate => 1,
  init_arg => 'values',
);

has definition_file => (
  is => 'ro',
  lazy => 1,
  default => sub { path(dist_dir('SunRiser'),'config_def.json')->absolute->stringify },
);

has types => (
  is => 'ro',
  lazy => 1,
  builder => 1,
);

sub _build_types {
  my ( $self ) = @_;
  my %types;
  for my $key (@{$self->_definition_data}) {
    $types{$key->[0]} = $key->[2] unless $key->[4];
  }
  return { %types };
}

sub type {
  my ( $self, @args ) = @_;
  my $key = join('#',@args);
  return defined $self->types->{$key} ? $self->types->{$key} : undef
}

has defaults => (
  is => 'ro',
  lazy => 1,
  builder => 1,
);

sub _build_defaults {
  my ( $self ) = @_;
  my %defaults;
  for my $key (@{$self->_definition_data}) {
    $defaults{$key->[0]} = $key->[3] unless $key->[4];
  }
  return { %defaults };
}

sub default {
  my ( $self, @args ) = @_;
  my $key = join('#',@args);
  return defined $self->defaults->{$key} ? $self->defaults->{$key} : undef
}

has _definition_data => (
  is => 'ro',
  lazy => 1,
  builder => 1,
);

sub _build__definition_data {
  my ( $self ) = @_;
  my @data;
  my $add = sub { push(@data,[ @_ ]) };
  $self->debug('Parsing definition file '.$self->definition_file);
  my $def = decode_json(path($self->definition_file)->slurp_utf8);
  $self->_definition_data_parse($add,"",@{$def});
  return [ @data ];
}

sub _definition_data_parse {
  my ( $self, $add, @args ) = @_;
  my $curr = shift @args;
  my $key = shift @args;
  my $next = shift @args;
  my $next_ref = ref $next;
  my $fullkey = join('#',$curr ? ( $curr ) : (),$key);
  if ($next_ref eq 'ARRAY') {
    $add->($fullkey,@{$next});
  } else {
    $add->($fullkey,$next,undef,undef,1) if $next;
    my $more = shift @args;
    $self->_definition_data_parse($add,$fullkey,@{$more});
  }
  if (@args) {
    $self->_definition_data_parse($add,$curr,@args);
  }
}

sub markdown {
  my ( $self ) = @_;
  my @rows = (
    "Key | Type | Default | Description",
    "--- | ---- |:-------:| -----------"
  );
  for my $def (@{$self->_definition_data}) {
    my ( $key, $desc, $type, $default, $submenu ) = @{$def};
    my $display_key = join(' # ',split(/#/,$key));
    if ($submenu) {
      push(@rows,join(' | ', '**'.$display_key.'**', "", "", '**'.$desc.'**'));      
    } else {
      push(@rows,join(' | ', $display_key, $type || "", defined $default ? $default : "", $desc));      
    }
  }
  return "\n\n".join("\n",@rows)."\n\n\n";
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
