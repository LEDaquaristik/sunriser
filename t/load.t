#!/usr/bin/env perl
use strict;
use warnings;
use Test::More;

for (qw(
  SunRiser
  SunRiser::CDB
  SunRiser::Config
  SunRiser::Publisher
  SunRiser::Simulator
)) {
  use_ok($_);
}

done_testing;

