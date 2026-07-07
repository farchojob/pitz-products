# Throttle the public, unauthenticated API by client IP. Tune with env vars.
class Rack::Attack
  API_LIMIT = Integer(ENV.fetch("RACK_ATTACK_LIMIT", 100))
  API_PERIOD = Integer(ENV.fetch("RACK_ATTACK_PERIOD", 60)) # seconds

  throttle("api/ip", limit: API_LIMIT, period: API_PERIOD) do |request|
    request.ip if request.path.start_with?("/api/")
  end

  # Respond to throttled requests with the same JSON error envelope the API uses elsewhere.
  self.throttled_responder = lambda do |request|
    match = request.env["rack.attack.match_data"] || {}
    body = {
      error: {
        status: 429,
        code: "too_many_requests",
        message: "Too many requests. Please slow down.",
        details: {}
      }
    }.to_json

    [ 429, { "Content-Type" => "application/json", "Retry-After" => match[:period].to_s }, [ body ] ]
  end
end
