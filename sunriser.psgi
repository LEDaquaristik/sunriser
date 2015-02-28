use FindBin;
use lib $FindBin::Dir . "/lib";
use SunRiser::Simulator;

my $srsim = SunRiser::Simulator->new( demo => 1 );
$srsim->psgi;
