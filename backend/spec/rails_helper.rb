# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!

# Load supporting files (custom matchers, shared contexts) from spec/support/.
Rails.root.glob('spec/support/**/*.rb').sort_by(&:to_s).each { |f| require f }

# Checks for pending migrations and applies them before tests are run.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_paths = [ Rails.root.join('spec/fixtures') ]

  # Each example runs inside a transaction that is rolled back afterwards.
  config.use_transactional_fixtures = true

  # Call build/create/etc. without the FactoryBot. prefix.
  config.include FactoryBot::Syntax::Methods

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
end

# shoulda-matchers: enables `should validate_presence_of(...)` etc.
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

# Rate limiting is disabled in the test suite (the rate-limiting spec re-enables it
# per-example), so a real cache store can never make unrelated request specs 429.
Rack::Attack.enabled = false
