# Be sure to restart your server when you modify this file.
#
# Allow the React frontend to call the API from a different origin.
# FRONTEND_ORIGIN is a comma-separated allowlist
# (e.g. "http://localhost:5173,https://app.example.com").
allowed_origins = ENV.fetch("FRONTEND_ORIGIN", "http://localhost:5173")
                     .split(",").map(&:strip).reject(&:blank?)

# Fail closed rather than silently allowing the localhost default in production,
# and never permit a wildcard origin.
raise "FRONTEND_ORIGIN must be set in production" if allowed_origins.empty? && Rails.env.production?
raise "Wildcard CORS origin '*' is not allowed" if allowed_origins.include?("*")

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "/api/v1/*",
             headers: :any,
             methods: %i[get post put patch delete options head]
  end
end
