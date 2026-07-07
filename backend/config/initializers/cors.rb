# Be sure to restart your server when you modify this file.
#
# Allow the React frontend to call the API from a different origin.
# FRONTEND_ORIGIN is a comma-separated allowlist
# (e.g. "http://localhost:5173,https://app.example.com").
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ENV.fetch("FRONTEND_ORIGIN", "http://localhost:5173").split(",").map(&:strip))

    resource "/api/v1/*",
             headers: :any,
             methods: %i[get post put patch delete options head]
  end
end
