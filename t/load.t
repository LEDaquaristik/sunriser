#!/usr/bin/env perl
use strict;
use warnings;
use Test::More;

for (qw(
  SunRiser
  SunRiser::Simulator
  SunRiser::Config
  SunRiser::Publisher
)) {
  use_ok($_);
}

done_testing;

