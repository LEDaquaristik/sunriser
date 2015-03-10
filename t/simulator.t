#!/usr/bin/env perl
use strict;
use warnings;
use Test::More;
use SunRiser::Simulator;
use SunRiser::Test;
use Test::TempDir::Tiny;

use FindBin;
use lib $FindBin::Dir."/lib";

my $srcfgdir = tempdir();
my $ts = SunRiser::Test->new( sim => SunRiser::Simulator->new( configdir => $srcfgdir ) );

$ts->base_test;

done_testing;
