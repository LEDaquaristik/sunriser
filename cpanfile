
requires 'AnyEvent', '0';
requires 'CDB::TinyCDB', '0';
requires 'CSS::Minifier::XS', '0';
requires 'Compress::Zlib', '0';
requires 'Data::MessagePack', '1.00';
requires 'Data::MessagePack::Stream', '1.04';
requires 'Data::Printer', '0';
requires 'Data::Coloured', '0';
requires 'Digest::DJB32', '0';
requires 'File::Copy::Recursive', '0';
requires 'File::ShareDir::ProjectDistDir', '0';
requires 'File::Temp', '0';
requires 'HTTP::Date', '0';
requires 'Compress::Zlib', '0';
requires 'JavaScript::Minifier', '0';
requires 'JSON::MaybeXS', '0';
requires 'Log::Any::Adapter', '0';
requires 'MooX', '0';
requires 'MooX::Options', '0';
requires 'MooX::Role::Logger', '0';
requires 'Path::Tiny', '0';
requires 'Plack', '0';
requires 'Plack::Middleware::Session', '0';
requires 'Server::Starter', '0';
requires 'Starman', '0';
requires 'Term::ReadKey', '0';
requires 'Test::Tester', '0';
requires 'Text::Xslate', '0';
requires 'Time::Zone', '0';
requires 'Twiggy::Server', '0';
requires 'Plack::Test::Agent', '0';
requires 'Plack::App::Proxy', '0';
requires 'Test::More', '0.96';

on test => sub {
  requires 'Test::TempDir::Tiny', '0';
};
