require "rails_helper"

RSpec.describe "Api::V1::Products", type: :request do
  # A method (not a memoized let) so examples that make several requests each
  # re-parse the latest response body.
  def json
    JSON.parse(response.body)
  end

  describe "GET /api/v1/products" do
    before { create_list(:product, 25) }

    it "returns the flat envelope with all six meta keys" do
      get "/api/v1/products"
      expect(response).to have_http_status(:ok)
      expect(json.keys).to contain_exactly("data", "meta")
      expect(json["meta"].keys).to contain_exactly("total", "page", "pages", "per_page", "next", "prev")
    end

    it "defaults to 10 items per page" do
      get "/api/v1/products"
      expect(json["data"].size).to eq(10)
      expect(json["meta"]).to include("per_page" => 10, "total" => 25, "pages" => 3, "page" => 1)
    end

    it "caps per_page at 100" do
      get "/api/v1/products", params: { per_page: 1_000_000 }
      expect(json["meta"]["per_page"]).to eq(100)
      expect(json["data"].size).to be <= 100
    end

    it "falls back to 10 for non-positive or garbage per_page" do
      %w[0 -5 abc].each do |bad|
        get "/api/v1/products", params: { per_page: bad }
        expect(json["meta"]["per_page"]).to eq(10)
      end
    end

    it "clamps garbage page to 1" do
      %w[0 -1 abc].each do |bad|
        get "/api/v1/products", params: { page: bad }
        expect(json["meta"]["page"]).to eq(1)
        expect(json["data"]).not_to be_empty
      end
    end

    it "returns empty data with coherent meta beyond the last page (no 500, prev is usable)" do
      get "/api/v1/products", params: { page: 99_999_999 }
      expect(response).to have_http_status(:ok)
      expect(json["data"]).to eq([])
      expect(json["meta"]["next"]).to be_nil
      expect(json["meta"]["prev"]).to eq(json["meta"]["pages"])
    end

    it "exposes prev/next links at the boundaries" do
      get "/api/v1/products", params: { page: 1 }
      expect(json["meta"]).to include("prev" => nil, "next" => 2)

      get "/api/v1/products", params: { page: 3 }
      expect(json["meta"]).to include("next" => nil, "prev" => 2)
    end

    it "orders by created_at desc (newest first), deterministically" do
      newest = create(:product)
      get "/api/v1/products"
      expect(json["data"].first["id"]).to eq(newest.id)
    end

    it "serializes price as a string" do
      get "/api/v1/products"
      expect(json["data"].first["price"]).to be_a(String)
    end

    describe "search" do
      before { create(:product, name: "Unique Zephyr Turbine", sku: "ZEP-1") }

      it "matches case-insensitively and reports the filtered total" do
        get "/api/v1/products", params: { search: "zephyr" }
        expect(json["meta"]["total"]).to eq(1)
        expect(json["data"].first["name"]).to eq("Unique Zephyr Turbine")
      end

      it "is injection-safe against LIKE wildcards and SQL payloads" do
        ["%", "_", "' OR 1=1", "'; DROP TABLE products; --"].each do |payload|
          get "/api/v1/products", params: { search: payload }
          expect(response).to have_http_status(:ok)
        end
        expect(Product.count).to be > 0
      end
    end

    describe "filter by state" do
      before do
        Product.delete_all
        create_list(:product, 3, active: true)
        create_list(:product, 2, :inactive)
      end

      it "filters active, inactive and all" do
        get "/api/v1/products", params: { active: "true" }
        expect(json["meta"]["total"]).to eq(3)
        get "/api/v1/products", params: { active: "false" }
        expect(json["meta"]["total"]).to eq(2)
        get "/api/v1/products"
        expect(json["meta"]["total"]).to eq(5)
      end

      it "does not silently return active-only for a garbage filter value" do
        get "/api/v1/products", params: { active: "banana" }
        expect(json["meta"]["total"]).to eq(5)
      end
    end
  end

  describe "GET /api/v1/products/:id" do
    let(:product) { create(:product) }

    it "returns a single-object envelope with price as a string" do
      get "/api/v1/products/#{product.id}"
      expect(response).to have_http_status(:ok)
      expect(json["data"]["id"]).to eq(product.id)
      expect(json["data"]["price"]).to be_a(String)
    end

    it "returns a 404 envelope for an unknown id" do
      get "/api/v1/products/999999"
      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq(
        "status" => 404, "code" => "not_found", "message" => "Resource not found", "details" => {}
      )
    end
  end

  describe "POST /api/v1/products" do
    let(:valid) do
      { name: "New Product", description: "A description", price: "12.50", stock: 4, sku: "new-9", active: true }
    end

    it "creates a product: 201, Location header, normalized sku, string price" do
      expect { post "/api/v1/products", params: { product: valid }, as: :json }
        .to change(Product, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(response.headers["Location"]).to match(%r{/api/v1/products/\d+})
      expect(json["data"]["sku"]).to eq("NEW-9")
      expect(json["data"]["price"]).to eq("12.5")
    end

    it "applies schema defaults when stock and active are omitted" do
      post "/api/v1/products", params: { product: valid.except(:stock, :active) }, as: :json
      expect(response).to have_http_status(:created)
      expect(json["data"]).to include("stock" => 0, "active" => true)
    end

    it "round-trips active:false" do
      post "/api/v1/products", params: { product: valid.merge(active: false, sku: "INA-1") }, as: :json
      expect(json["data"]["active"]).to be(false)
    end

    it "returns 422 parameter_missing when the product key is absent" do
      post "/api/v1/products", params: {}, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]["code"]).to eq("parameter_missing")
      expect(json["error"]["details"]).to eq("product" => ["is required"])
    end

    it "returns a 422 validation envelope with per-field details" do
      post "/api/v1/products",
           params: { product: { name: "ab", description: "x" * 1001, price: "0", stock: -5, sku: "bad sku!" } },
           as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]["code"]).to eq("validation_error")
      expect(json["error"]["details"].keys).to include("name", "description", "price", "stock", "sku")
    end

    it "returns 422 (not 500) for an oversized price" do
      post "/api/v1/products", params: { product: valid.merge(price: "100000000", sku: "OVR-1") }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects a case-insensitive duplicate sku" do
      create(:product, sku: "DUP-1")
      post "/api/v1/products", params: { product: valid.merge(sku: "dup-1") }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]["details"]).to eq("sku" => ["has already been taken"])
    end

    it "surfaces a DB-level unique race as a clean 422 (not a 500)" do
      allow(Product).to receive(:create!).and_raise(ActiveRecord::RecordNotUnique.new("duplicate key"))
      post "/api/v1/products", params: { product: valid.merge(sku: "RACE-1") }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]["details"]).to eq("sku" => ["has already been taken"])
    end

    it "ignores server-controlled and unknown attributes (mass assignment)" do
      post "/api/v1/products",
           params: { product: valid.merge(id: 999_999, created_at: "2000-01-01T00:00:00Z", admin: true, sku: "MASS-1") },
           as: :json
      expect(response).to have_http_status(:created)
      created = Product.find(json["data"]["id"])
      expect(created.id).not_to eq(999_999)
      expect(created.created_at.year).not_to eq(2000)
    end
  end

  describe "PUT/PATCH /api/v1/products/:id" do
    let(:product) { create(:product, name: "Original", stock: 1, sku: "UPD-1") }

    %i[put patch].each do |verb|
      it "updates via #{verb.upcase}" do
        public_send(verb, "/api/v1/products/#{product.id}",
                    params: { product: { name: "Renamed", stock: 9 } }, as: :json)
        expect(response).to have_http_status(:ok)
        expect(json["data"]).to include("name" => "Renamed", "stock" => 9)
      end
    end

    it "leaves untouched fields unchanged and re-normalizes sku" do
      put "/api/v1/products/#{product.id}", params: { product: { sku: "upd-2" } }, as: :json
      expect(json["data"]).to include("sku" => "UPD-2", "name" => "Original")
    end

    it "returns 404 for an unknown id" do
      put "/api/v1/products/999999", params: { product: { name: "X" } }, as: :json
      expect(response).to have_http_status(:not_found)
    end

    it "returns 422 for an invalid update" do
      put "/api/v1/products/#{product.id}", params: { product: { price: "0" } }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/products/:id" do
    let!(:product) { create(:product) }

    it "returns 204 and removes the record" do
      expect { delete "/api/v1/products/#{product.id}" }.to change(Product, :count).by(-1)
      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
    end

    it "returns 404 for an unknown id" do
      delete "/api/v1/products/999999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "unexpected errors" do
    it "renders a clean 500 envelope without leaking internals" do
      allow(Product).to receive(:search_by_name).and_raise(StandardError, "boom-secret")
      get "/api/v1/products"
      expect(response).to have_http_status(:internal_server_error)
      expect(json["error"]).to eq(
        "status" => 500, "code" => "internal_server_error", "message" => "Something went wrong", "details" => {}
      )
      expect(response.body).not_to include("boom-secret")
      expect(response.body).not_to match(/\.rb:\d+/)
    end
  end

  describe "CORS" do
    it "echoes an allowlisted origin (not a wildcard) and sets no credentials header" do
      get "/api/v1/products", headers: { "Origin" => "http://localhost:5173" }
      expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:5173")
      expect(response.headers["Access-Control-Allow-Credentials"]).to be_nil
    end

    it "does not authorize a non-allowlisted origin" do
      get "/api/v1/products", headers: { "Origin" => "http://evil.example" }
      expect(response.headers["Access-Control-Allow-Origin"]).to be_nil
    end
  end
end
