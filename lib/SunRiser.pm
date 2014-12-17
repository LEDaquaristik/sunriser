package SunRiser;
# ABSTRACT: LEDaquaristik.de SunRiser Simulator & Builder

use strict;
use warnings;

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

1;

=head1 DESCRIPTION

=head1 SUPPORT

Repository

  http://github.com/LEDaquaristik/sunriser
  Pull request and additional contributors are welcome
 
Issue Tracker

  http://github.com/LEDaquaristik/sunriser/issues

=cut
