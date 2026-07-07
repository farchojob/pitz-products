class ApplicationController < ActionController::API
  # Handlers are matched most-recently-registered first, so the generic
  # StandardError rescue is declared FIRST (checked last) and the specific
  # ones below take precedence.
  rescue_from StandardError,                        with: :render_internal_error
  rescue_from ActiveRecord::RecordNotFound,         with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid,          with: :render_validation_error
  rescue_from ActiveRecord::RecordNotUnique,        with: :render_not_unique
  rescue_from ActionController::ParameterMissing,   with: :render_parameter_missing

  private

  # Single, consistent error envelope for every failure: { error: { status, code, message, details } }.
  def render_error(status:, code:, message:, details: {})
    render json: {
      error: {
        status: Rack::Utils.status_code(status),
        code: code,
        message: message,
        details: details
      }
    }, status: status
  end

  def render_not_found(_exception)
    render_error(status: :not_found, code: "not_found", message: "Resource not found")
  end

  def render_validation_error(exception)
    render_error(
      status: :unprocessable_entity,
      code: "validation_error",
      message: "Validation failed",
      details: exception.record.errors.messages
    )
  end

  # DB-level unique violation that slipped past the app validation (race condition).
  def render_not_unique(_exception)
    render_error(
      status: :unprocessable_entity,
      code: "validation_error",
      message: "Validation failed",
      details: { sku: ["has already been taken"] }
    )
  end

  def render_parameter_missing(exception)
    render_error(
      status: :unprocessable_entity,
      code: "parameter_missing",
      message: exception.message,
      details: { exception.param => ["is required"] }
    )
  end

  # Rescued in every environment so a caller always gets the clean JSON envelope
  # (never a leaked backtrace / HTML error page). Full details go to the logs.
  def render_internal_error(exception)
    Rails.logger.error("#{exception.class}: #{exception.message}")
    Rails.logger.error(exception.backtrace.first(20).join("\n")) if exception.backtrace
    render_error(status: :internal_server_error, code: "internal_server_error", message: "Something went wrong")
  end
end
