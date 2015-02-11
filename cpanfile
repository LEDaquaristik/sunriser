
requires 'AnyEvent', '0';
requires 'CDB::TinyCDB', '0';
requires 'CSS::Minifier::XS', '0';
requires 'Data::MessagePack', '0';
requires 'Data::Printer', '0';
requires 'Data::Coloured', '0';
requires 'Digest::DJB32', '0';
requires 'File::Copy::Recursive', '0';
requires 'File::ShareDir::ProjectDistDir', '0';
requires 'File::Temp', '0';
requires 'HTTP::Date', '0';
requires 'IO::Compress::Base', '0';
requires 'JavaScript::Minifier', '0';
requires 'JSON::MaybeXS', '0';
requires 'Log::Any::Adapter', '0';
requires 'MooX', '0';
requires 'MooX::Options', '0';
requires 'MooX::Role::Logger', '0';
requires 'Path::Tiny', '0';
requires 'Plack', '0';
requires 'Text::Xslate', '0';
requires 'Time::Zone', '0';
requires 'Twiggy::Server', '0';

on test => sub {
  requires 'Test::More', '0.96';
};

