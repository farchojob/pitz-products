class Product < ApplicationRecord
  # Uppercase letters, digits and hyphens. Kept byte-identical with the frontend
  # zod schema so client and server accept/reject exactly the same SKUs.
  SKU_FORMAT = /\A[A-Z0-9-]+\z/

  before_validation :normalize_sku

  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :stock, presence: true,
                    numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :sku, presence: true,
                  uniqueness: { case_sensitive: false },
                  format: { with: SKU_FORMAT,
                            message: "only allows uppercase letters, numbers, and hyphens" }
  # inclusion (not presence) — presence would reject the valid value `false`.
  validates :active, inclusion: { in: [true, false] }

  scope :active_only,   -> { where(active: true) }
  scope :inactive_only, -> { where(active: false) }

  # Filter by state. Accepts "true"/"false"/"1"/"0"; blank returns everything.
  scope :by_state, ->(state) {
    return all if state.blank?

    where(active: ActiveModel::Type::Boolean.new.cast(state))
  }

  # Case-insensitive name search backed by the pg_trgm GIN index.
  # sanitize_sql_like escapes % and _ so user input can't inject LIKE wildcards.
  scope :search_by_name, ->(query) {
    return all if query.blank?

    where("name ILIKE ?", "%#{sanitize_sql_like(query.strip)}%")
  }

  private

  def normalize_sku
    self.sku = sku.strip.upcase if sku.present?
  end
end
