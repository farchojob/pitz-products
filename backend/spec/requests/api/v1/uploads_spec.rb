require "rails_helper"

RSpec.describe "Api::V1::Uploads", type: :request do
  def json
    JSON.parse(response.body)
  end

  # A real committed seed image doubles as the multipart fixture.
  let(:seed_jpg) { Rails.root.join("public/uploads/seed/1.jpg") }
  def uploaded(type: "image/jpeg", path: seed_jpg)
    Rack::Test::UploadedFile.new(path, type)
  end

  # Remove anything written to the uploads root (never the committed seed/ dir).
  after do
    Dir[Rails.root.join("public/uploads/*.{jpg,png,webp}")].each { |f| FileUtils.rm_f(f) }
  end

  describe "POST /api/v1/uploads" do
    it "stores the image and returns a served /uploads url" do
      post "/api/v1/uploads", params: { file: uploaded }
      expect(response).to have_http_status(:created)
      url = json["data"]["url"]
      expect(url).to match(%r{\A/uploads/[0-9a-f-]+\.jpg\z})
      expect(File.exist?(Rails.root.join("public#{url}"))).to be(true)
    end

    it "does not trust the client filename (generated name, no traversal)" do
      post "/api/v1/uploads",
           params: { file: Rack::Test::UploadedFile.new(seed_jpg, "image/png", original_filename: "../../evil.png") }
      expect(response).to have_http_status(:created)
      expect(json["data"]["url"]).not_to include("evil")
      expect(json["data"]["url"]).not_to include("..")
    end

    it "422s an unsupported content type" do
      post "/api/v1/uploads", params: { file: uploaded(type: "application/pdf") }
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["error"]["code"]).to eq("invalid_upload")
    end

    it "422s when no file is provided" do
      post "/api/v1/uploads", params: {}
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "422s a file over the 5 MB limit" do
      big = Tempfile.new([ "big", ".png" ])
      big.binmode
      big.write("0" * (5 * 1024 * 1024 + 1))
      big.rewind
      post "/api/v1/uploads", params: { file: Rack::Test::UploadedFile.new(big.path, "image/png") }
      expect(response).to have_http_status(:unprocessable_content)
    ensure
      big&.close!
    end
  end
end
