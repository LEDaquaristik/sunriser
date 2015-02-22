package SunRiser::Publisher;
# ABSTRACT: SunRiser static file generation

use Moo;

with 'SunRiser::Role::Logger';

sub _build__logger_category { 'SR_PUBLISHER' }

use Text::Xslate qw( mark_raw );
use Path::Tiny;
use File::ShareDir::ProjectDistDir;
use SunRiser::Config;
use JSON::MaybeXS;
use JavaScript::Minifier qw( minify );
use CSS::Minifier::XS;
use Carp qw( croak );

has versioned => (
  is => 'lazy',
);

sub _build_versioned { $SunRiser::VERSION || $ENV{V} || 0 }

has config => (
  is => 'lazy',
);

sub _build_config {
  my ( $self ) = @_;
  return SunRiser::Config->new;
}

has publish_files => (
  is => 'lazy',
);

sub _build_publish_files {
  my ( $self ) = @_;
  my @versioned;
  if ($self->versioned) {
    @versioned = (
      "css/all-".$self->versioned.".css",
      "js/all-".$self->versioned.".js",
    );
  } else {
    @versioned = qw( sr_config_def.json );
  }
  return [qw(

    backup.html
    clouds.html
    contact.html
    day.html
    firmware.html
    index.html
    intro.html
    led.html
    licenses.html
    login.html
    moon.html
    network.html
    password.html
    rain.html
    system.html
    sysinfo.html
    test.html
    thunderstorm.html
    upgraded.html

    notfound.html

  ), @versioned];
}

sub has_publish_file {
  my ( $self, $file ) = @_;
  my %files = ( map { $_, 1 } @{$self->publish_files} );
  return defined $files{$file};
}

sub publish_to {
  my ( $self, $dir ) = @_;
  $self->info('Publishing all files to '.$dir);
  my @files = @{$self->publish_files};
  for my $filename (@files) {
    my $file = path($dir,$filename);
    $file->parent->mkpath unless -d $file->parent;
    $file->spew_raw($self->render($filename));
  }
}

sub render {
  my ( $self, $file ) = @_;
  my @parts = split('\.',$file);
  my $ext = pop @parts;
  my $filename = pop @parts;
  if ($ext eq 'html') {
    $self->info('Generating '.$file.' from template');
    my $template = $file.'.tx';
    my %vars = %{$self->base_vars};
    $vars{file} = $file;
    return $self->template_engine->render($template,\%vars);    
  } elsif ($ext eq 'json') {
    my $func = 'json_'.$filename;
    $self->info('Generating '.$file.' from function '.$func);
    return encode_json($self->$func());
  } elsif ($ext eq 'css') {
    return $self->render_all_css();
  } elsif ($ext eq 'js') {
    return $self->render_all_js();
  }
  croak "Don't know how to render ".$ext;
}

########################################################################

sub render_all_css {
  my ( $self ) = @_;
  my $css = "";
  my $share = path(dist_dir('SunRiser'),'web');
  for my $css_file (@{$self->base_vars->{css_files}}) {
    $css .= $share->child($css_file)->slurp;
  }
  $css = CSS::Minifier::XS::minify($css);
  return $css;
}

sub render_all_js {
  my ( $self ) = @_;
  my $js = "var sr_config_def_factory = ".encode_json($self->json_sr_config_def).";\n";
  my $share = path(dist_dir('SunRiser'),'web');
  for my $js_file (@{$self->base_vars->{js_files}}) {
    $js .= $share->child($js_file)->slurp;
  }
  $js = minify( input => $js );
  return $js;  
}

########################################################################

sub json_sr_config_def {
  my ( $self ) = @_;
  my @keys = keys %{$self->config->types};
  return {map {
    $_, {
      type => $self->config->types->{$_},
      defined $self->config->defaults->{$_}
        ? ( default => $self->config->defaults->{$_} ) : (),
    };
  } @keys};
}

########################################################################

has base_vars => (
  is => 'lazy',
);

sub _build_base_vars {
  my ( $self ) = @_;
  return {
    pwm_count => 8,
    versioned => $self->versioned,
    css_files => [qw(
      css/reset.css
      css/tipr-1.0.1.css
      css/icomoon.css
      css/OpenSans-Regular-webfont.css
      css/sunriser.css
      css/sunriser_dayplanner.css
    )],
    js_files => [
      $self->versioned ? 'js/jquery-1.11.2.min.js' : 'js/jquery-1.11.2.js',
      $self->versioned ? 'js/moment-2.9.0.min.js' : 'js/moment-2.9.0.js',
      $self->versioned ? 'js/snap.svg-0.3.0.min.js' : 'js/snap.svg-0.3.0.js',
      $self->versioned ? 'js/interact-1.2.3.min.js' : 'js/interact-1.2.3.js',
    qw(
      js/tmpl.js
      js/class.js
      js/msgpack-1.05-patched.js
      js/console-emulation.js
      js/moment-locale-de.js
      js/tipr-1.0.1.js
      js/ipaddr-0.1.3.js
      js/jquery-ajax-blob-arraybuffer.js

      js/sunriser_colors_config.js
      js/sunriser_forms_config.js

      js/sunriser_SrForm.js
      js/sunriser_SrField.js

      js/sunriser_firmware.js
      js/sunriser_network.js
      js/sunriser_config.js
      js/sunriser_interface.js
      js/sunriser.js
    )],
  };
}

has template_path => (
  is => 'lazy',
);

sub _build_template_path {
  path(dist_dir('SunRiser'),'templates')->absolute->stringify
}

has template_engine => (
  is => 'lazy',
);

sub _build_template_engine {
  my ( $self ) = @_;
  my $templates = $self->template_path;
  return Text::Xslate->new(
    path => [$templates],
    function => {
      r => sub { return mark_raw(join("",@_)) },
      substr => sub {
        my($str, $offset, $length) = @_;
        return undef unless defined $str;
        $offset = 0 unless defined $offset;
        $length = length($str) unless defined $length;
        return CORE::substr($str, $offset, $length);
      },
      lc => sub {
        return defined($_[0]) ? CORE::lc($_[0]) : undef;
      },
      uc => sub {
        return defined($_[0]) ? CORE::uc($_[0]) : undef;
      },
    },
  );
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
