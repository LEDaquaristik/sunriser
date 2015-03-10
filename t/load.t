#!/usr/bin/env perl
use strict;
use warnings;
use Test::More;

for (qw(
  SunRiser
  SunRiser::CDB
  SunRiser::Config
  SunRiser::Finder
  SunRiser::Publisher
  SunRiser::Role::Logger
  SunRiser::Simulator
  SunRiser::Test
)) {
  use_ok($_);
}

done_testing;

