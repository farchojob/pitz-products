require "rails_helper"

RSpec.describe "Rate limiting", type: :request do
  # rack-attack uses Rails.cache (null store) in test by default, so give it a real
  # counter for these examples and restore it afterwards.
  around do |example|
    original = Rack::Attack.cache.store
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    example.run
    Rack::Attack.cache.store = original
  end

  it "throttles a client that exceeds the per-IP limit (429 with the error envelope)" do
    limit = Rack::Attack::API_LIMIT

    limit.times { get "/api/v1/products" }
    expect(response).to have_http_status(:ok)

    get "/api/v1/products" # one over the limit
    expect(response).to have_http_status(:too_many_requests)

    body = JSON.parse(response.body)
    expect(body["error"]).to include("code" => "too_many_requests", "status" => 429)
    expect(response.headers["Retry-After"]).to be_present
  end
end
