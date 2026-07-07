class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    enable_extension "pg_trgm" unless extension_enabled?("pg_trgm")

    create_table :products do |t|
      t.string  :name,        null: false
      t.text    :description
      t.decimal :price,       precision: 10, scale: 2, null: false
      t.integer :stock,       null: false, default: 0
      t.string  :sku,         null: false
      t.boolean :active,      null: false, default: true

      t.timestamps
    end

    # Case-insensitive uniqueness guard, mirroring the model's
    # `uniqueness: { case_sensitive: false }` and normalize-to-upper callback.
    add_index :products, "LOWER(sku)", unique: true, name: "index_products_on_lower_sku"

    # Trigram GIN index makes the leading-wildcard `name ILIKE '%q%'` search index-usable.
    add_index :products, :name, using: :gin, opclass: :gin_trgm_ops,
                                 name: "index_products_on_name_trgm"

    # Supports the active/inactive filter.
    add_index :products, :active

    # Defense-in-depth: the numeric invariants are also enforced at the DB layer.
    add_check_constraint :products, "price > 0",   name: "products_price_positive"
    add_check_constraint :products, "stock >= 0",  name: "products_stock_non_negative"
  end
end
