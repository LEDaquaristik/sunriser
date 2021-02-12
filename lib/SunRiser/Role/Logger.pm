package SunRiser::Role::Logger;
# ABSTRACT: Role for logging

use Moo::Role;
use Log::Any::Adapter ('Stdout');

with 'MooX::Role::Logger';

sub trace { shift->_logger->trace(@_) }
sub debug { shift->_logger->debug(@_) }
sub info { shift->_logger->info(@_) }
sub notice { shift->_logger->notice(@_) }
sub warning { shift->_logger->warning(@_) }

1;

=head1 DESCRIPTION

=head1 SUPPORT

Repository

  https://github.com/LEDaquaristik/sunriser
  Pull request and additional contributors are welcome

Issue Tracker

  https://github.com/LEDaquaristik/sunriser/issues

=cut
