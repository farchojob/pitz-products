class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :stock, :sku, :active, :created_at, :updated_at

  # Serialize price as a string to preserve decimal precision over JSON
  # (JS numbers are floats and silently lose cents on large/edge values).
  field :price do |product|
    product.price.to_s
  end
end
