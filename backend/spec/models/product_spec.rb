require "rails_helper"

RSpec.describe Product, type: :model do
  it "is valid with the factory defaults" do
    expect(build(:product)).to be_valid
  end

  describe "name" do
    it { is_expected.to validate_presence_of(:name) }

    it "requires between 3 and 100 characters" do
      expect(build(:product, name: "ab")).to be_invalid
      expect(build(:product, name: "abc")).to be_valid
      expect(build(:product, name: "a" * 100)).to be_valid
      expect(build(:product, name: "a" * 101)).to be_invalid
    end
  end

  describe "description" do
    it "is optional (nil or blank allowed)" do
      expect(build(:product, description: nil)).to be_valid
      expect(build(:product, description: "")).to be_valid
    end

    it "allows at most 1000 characters" do
      expect(build(:product, description: "a" * 1000)).to be_valid
      expect(build(:product, description: "a" * 1001)).to be_invalid
    end
  end

  describe "price" do
    it { is_expected.to validate_presence_of(:price) }

    it "must be greater than 0" do
      expect(build(:product, price: 0)).to be_invalid
      expect(build(:product, price: -0.01)).to be_invalid
      expect(build(:product, price: 0.01)).to be_valid
    end

    it "rejects non-numeric values" do
      expect(build(:product, price: "abc")).to be_invalid
    end

    it "rejects values that would overflow the decimal(10,2) column" do
      expect(build(:product, price: 100_000_000)).to be_invalid
      expect(build(:product, price: 99_999_999.99)).to be_valid
    end
  end

  describe "stock" do
    it { is_expected.to validate_presence_of(:stock) }

    it "must be a non-negative integer" do
      expect(build(:product, stock: -1)).to be_invalid
      expect(build(:product, stock: 1.5)).to be_invalid
      expect(build(:product, stock: 0)).to be_valid
      expect(build(:product, stock: 5)).to be_valid
    end
  end

  describe "active" do
    it "accepts true and false (inclusion, not presence — false must be allowed)" do
      expect(build(:product, active: true)).to be_valid
      expect(build(:product, active: false)).to be_valid
    end

    it "rejects a nil/non-boolean value" do
      expect(build(:product, active: nil)).to be_invalid
    end
  end

  describe "sku format and normalization" do
    it "accepts uppercase letters, digits and hyphens" do
      ["ABC-123", "A", "1", "A-1", "-ABC", "ABC-"].each do |good|
        expect(build(:product, sku: good)).to(be_valid, "expected #{good.inspect} to be valid")
      end
    end

    it "normalizes lowercase and surrounding whitespace before validating" do
      product = build(:product, sku: "  abc-9 ")
      expect(product).to be_valid
      product.validate
      expect(product.sku).to eq("ABC-9")
    end

    it "rejects values that remain invalid after upcasing (incl. hyphen-only)" do
      ["AB C", "ABC_1", "ABC!", "-", "---", "A/B", "AB\nCD"].each do |bad|
        expect(build(:product, sku: bad)).to(be_invalid, "expected #{bad.inspect} to be invalid")
      end
    end

    it "re-normalizes sku on update" do
      product = create(:product, sku: "ABC-1")
      product.update!(sku: "xyz-2")
      expect(product.reload.sku).to eq("XYZ-2")
    end
  end

  describe "sku uniqueness (case-insensitive)" do
    before { create(:product, sku: "DUP-1") }

    it "rejects a duplicate that differs only by case" do
      duplicate = build(:product, sku: "dup-1")
      expect(duplicate).to be_invalid
      expect(duplicate.errors[:sku]).to include("has already been taken")
    end
  end

  describe "schema-backed defaults" do
    it "loads stock 0 and active true onto a new record" do
      product = Product.new
      expect(product.stock).to eq(0)
      expect(product.active).to be(true)
    end

    it "persists when stock and active are omitted, applying the defaults" do
      product = Product.create!(name: "Defaulter", price: 5, sku: "DEF-1")
      expect(product.stock).to eq(0)
      expect(product.active).to be(true)
    end
  end

  describe "database check constraints (defense-in-depth)" do
    it "rejects a raw price <= 0 even when model validations are bypassed" do
      product = build(:product, price: -1)
      expect { product.save!(validate: false) }
        .to raise_error(ActiveRecord::StatementInvalid, /products_price_positive/)
    end

    it "rejects a raw negative stock even when model validations are bypassed" do
      product = build(:product, stock: -1)
      expect { product.save!(validate: false) }
        .to raise_error(ActiveRecord::StatementInvalid, /products_stock_non_negative/)
    end
  end

  describe "soft delete (discard)" do
    it "hides the record from .kept while keeping the row" do
      product = create(:product)
      expect { product.discard }.to change(Product.kept, :count).by(-1)
      expect(Product.count).to eq(1)
      expect(product.discarded?).to be(true)
    end

    it "lets a discarded product's SKU be reused" do
      create(:product, sku: "REUSE-1").discard
      expect(build(:product, sku: "REUSE-1")).to be_valid
      expect { create(:product, sku: "REUSE-1") }.not_to raise_error
    end
  end

  describe "scopes" do
    let!(:active_widget)   { create(:product, name: "Premium Widget", active: true,  sku: "W-1") }
    let!(:inactive_gadget) { create(:product, name: "Cheap Gadget",   active: false, sku: "G-1") }

    describe ".active_only / .inactive_only" do
      it "partitions by the active flag" do
        expect(Product.active_only).to contain_exactly(active_widget)
        expect(Product.inactive_only).to contain_exactly(inactive_gadget)
      end
    end

    describe ".by_state" do
      it "returns active-only for true-ish tokens" do
        %w[true 1 t TRUE].each { |token| expect(Product.by_state(token)).to contain_exactly(active_widget) }
      end

      it "returns inactive-only for false-ish tokens" do
        %w[false 0 f FALSE].each { |token| expect(Product.by_state(token)).to contain_exactly(inactive_gadget) }
      end

      it "returns everything for blank input" do
        [nil, "", "   "].each { |blank| expect(Product.by_state(blank)).to match_array([active_widget, inactive_gadget]) }
      end

      it "returns everything (never silently active-only) for garbage input" do
        %w[banana 2 yes maybe].each { |garbage| expect(Product.by_state(garbage)).to match_array([active_widget, inactive_gadget]) }
      end
    end

    describe ".search_by_name" do
      it "matches case-insensitively on a fragment" do
        expect(Product.search_by_name("widget")).to contain_exactly(active_widget)
        expect(Product.search_by_name("WIDGET")).to contain_exactly(active_widget)
      end

      it "returns everything for blank input" do
        expect(Product.search_by_name("")).to match_array([active_widget, inactive_gadget])
        expect(Product.search_by_name(nil)).to match_array([active_widget, inactive_gadget])
      end

      it "treats % and _ as literals (escapes LIKE wildcards)" do
        literal = create(:product, name: "50% Off", sku: "P-1")
        create(:product, name: "500 Off", sku: "P-2")
        expect(Product.search_by_name("50%")).to contain_exactly(literal)
      end

      it "caps pathologically long input without error" do
        expect { Product.search_by_name("a" * 10_000).to_a }.not_to raise_error
      end

      it "composes with by_state" do
        create(:product, name: "Premium Widget XL", active: false, sku: "W-2")
        expect(Product.search_by_name("widget").by_state("true")).to contain_exactly(active_widget)
      end
    end
  end
end
