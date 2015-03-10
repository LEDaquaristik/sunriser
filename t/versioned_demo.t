#!/usr/bin/env perl
use strict;
use warnings;
use Test::More;
use SunRiser::Simulator;
use SunRiser::Test;

use FindBin;
use lib $FindBin::Dir."/lib";

my $ts = SunRiser::Test->new( sim => SunRiser::Simulator->new( demo => 1, versioned => '1.234' ) );

$ts->base_test;

done_testing;
