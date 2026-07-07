class Product < ApplicationRecord
  # Soft deletes: adds `discard`/`undiscard` and the `kept`/`discarded` scopes.
  # No default_scope on purpose — queries opt in with `.kept` so nothing is hidden by surprise.
  include Discard::Model

  # Change auditing: records what changed and when on every create/update/destroy.
  # The actor ("who") is null here because the app has no authentication (see README).
  audited

  # Uppercase letters, digits and hyphens, requiring at least one alphanumeric so a
  # pure-punctuation SKU like "-" or "---" is rejected. Kept identical to the frontend
  # zod schema (^(?=.*[A-Z0-9])[A-Z0-9-]+$) so client and server accept/reject the same SKUs.
  SKU_FORMAT = /\A(?=.*[A-Z0-9])[A-Z0-9-]+\z/

  before_validation :normalize_sku

  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  # less_than guards the decimal(10,2) column so an oversized price is a clean 422
  # instead of a DB range error surfacing as a 500.
  validates :price, presence: true,
                    numericality: { greater_than: 0, less_than: 100_000_000 }
  validates :stock, presence: true,
                    numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  # Uniqueness scoped to kept rows (matching the partial DB index) so a discarded SKU is reusable.
  validates :sku, presence: true,
                  uniqueness: { case_sensitive: false, conditions: -> { kept } },
                  format: { with: SKU_FORMAT,
                            message: "only allows uppercase letters, numbers, and hyphens" }
  # inclusion (not presence) — presence would reject the valid value `false`.
  validates :active, inclusion: { in: [true, false] }

  scope :active_only,   -> { where(active: true) }
  scope :inactive_only, -> { where(active: false) }

  # Filter by state. Accepts true/false/1/0/t/f in any case; anything else — blank or
  # garbage like "banana" — returns everything, so a malformed value never silently
  # masquerades as active-only.
  scope :by_state, ->(state) {
    normalized = state.to_s.strip.downcase
    return all unless %w[true false 1 0 t f].include?(normalized)

    where(active: %w[true 1 t].include?(normalized))
  }

  # Case-insensitive name search backed by the pg_trgm GIN index. The term is length-capped
  # (a pathological multi-KB value builds a giant ILIKE pattern) and sanitize_sql_like
  # escapes % and _ so user input can't inject LIKE wildcards.
  scope :search_by_name, ->(query) {
    term = query.to_s.strip.first(100)
    return all if term.blank?

    where("name ILIKE ?", "%#{sanitize_sql_like(term)}%")
  }

  private

  def normalize_sku
    self.sku = sku.strip.upcase if sku.present?
  end
end
