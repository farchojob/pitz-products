module Api
  module V1
    # Stores a product image in the local public/uploads folder and returns its
    # served path. Images are kept on local disk (v1 scope); the path is what the
    # product's image_url stores. Note: on an ephemeral host (e.g. Render free tier)
    # runtime uploads don't survive a redeploy — a cloud store would replace this.
    class UploadsController < ApplicationController
      MAX_BYTES = 5 * 1024 * 1024
      # content_type => extension. Whitelisted so an unexpected type can't be written.
      ALLOWED = { "image/jpeg" => ".jpg", "image/png" => ".png", "image/webp" => ".webp" }.freeze
      UPLOAD_DIR = Rails.root.join("public/uploads")

      # POST /api/v1/uploads  (multipart form field: file)
      def create
        file = params[:file]
        return reject("No image file was provided.") unless file.respond_to?(:tempfile)

        ext = ALLOWED[file.content_type]
        return reject("Unsupported image type — use JPG, PNG or WEBP.") unless ext
        return reject("Image exceeds the 5 MB limit.") if file.size > MAX_BYTES

        # Generated filename: never trust the client name (path traversal / overwrite).
        filename = "#{SecureRandom.uuid}#{ext}"
        FileUtils.mkdir_p(UPLOAD_DIR)
        File.binwrite(UPLOAD_DIR.join(filename), file.tempfile.read)

        render json: { data: { url: "/uploads/#{filename}" } }, status: :created
      end

      private

      def reject(message)
        render json: {
          error: { status: 422, code: "invalid_upload", message: message, details: {} }
        }, status: :unprocessable_content
      end
    end
  end
end
