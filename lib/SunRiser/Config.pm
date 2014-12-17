package SunRiser::Config;
# ABSTRACT: SunRiser Config Management

use Moo;

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_CONFIG' }

use JSON::MaybeXS;
use Path::Tiny;
use File::ShareDir::ProjectDistDir;
use Carp qw( croak );

has definition_file => (
  is => 'lazy',
);

sub _build_definition_file {
  path(dist_dir('SunRiser'),'config_def.json')->absolute->stringify
}

has types => (
  is => 'lazy',
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
  for my $tk (keys %{$self->types}) {
    my $tkr = $tk; $tkr =~ s/X/[\/\\-\\.\\w]+/g;
    if ($key =~ m/^$tkr$/) {
      return $self->types->{$tk};
    }
  }
  croak "Cant find definition for ".$key;
}

has defaults => (
  is => 'lazy',
);

sub _build_defaults {
  my ( $self ) = @_;
  my %defaults;
  for my $key (@{$self->_definition_data}) {
    $defaults{$key->[0]} = $key->[3] unless $key->[4] or !defined $key->[3];
  }
  return { %defaults };
}

sub default {
  my ( $self, @args ) = @_;
  my $key = join('#',@args);
  for my $dk (keys %{$self->defaults}) {
    my $dkr = $dk; $dkr =~ s/X/[\/\\-\\.\\w]+/g;
    if ($key =~ m/^$dkr$/) {
      return $self->defaults->{$dk};
    }
  }
  return undef;
}

has _definition_data => (
  is => 'lazy',
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

sub get_defaults {
  my ( $self, @args ) = @_;
  return {map {
    $_ =~ m/X/ ? () : ( $_, $self->defaults->{$_} );
  } keys %{$self->defaults}} unless scalar @args;
  my $base = join('#',@args);
  croak 'TODO';
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
