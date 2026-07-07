class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :stock, :sku, :active, :created_at, :updated_at

  # Serialize price as a string to preserve decimal precision over JSON
  # (JS numbers are floats and silently lose cents on large/edge values).
  field :price do |product|
    # Fixed 2-decimal string (12.50 stays "12.50", not "12.5") to preserve cents over JSON.
    format("%.2f", product.price)
  end
end
