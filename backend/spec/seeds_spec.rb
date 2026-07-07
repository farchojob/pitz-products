require "rails_helper"
require "stringio"

RSpec.describe "db/seeds.rb" do
  def run_seeds
    original = $stdout
    $stdout = StringIO.new
    load Rails.root.join("db/seeds.rb")
  ensure
    $stdout = original
  end

  it "is idempotent — running twice creates no duplicates" do
    run_seeds
    first_count = Product.count
    expect(first_count).to be >= 55

    run_seeds
    expect(Product.count).to eq(first_count)
  end
end
