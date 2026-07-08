require "rails_helper"

RSpec.describe "Root", type: :request do
  it "redirects the API host root to the Swagger docs (no blank 404)" do
    get "/"
    expect(response).to have_http_status(:found)
    expect(response).to redirect_to("/api-docs")
  end
end
