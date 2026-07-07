class AddDiscardToProducts < ActiveRecord::Migration[7.1]
  def up
    add_column :products, :discarded_at, :datetime
    add_index :products, :discarded_at

    # Re-scope SKU uniqueness to kept (non-discarded) rows, so the SKU of a
    # soft-deleted product can be reused by a new one.
    remove_index :products, name: "index_products_on_lower_sku"
    add_index :products, "LOWER(sku)", unique: true, where: "discarded_at IS NULL",
                                        name: "index_products_on_lower_sku"
  end

  def down
    remove_index :products, name: "index_products_on_lower_sku"
    add_index :products, "LOWER(sku)", unique: true, name: "index_products_on_lower_sku"

    remove_index :products, :discarded_at
    remove_column :products, :discarded_at
  end
end
