require "rails_helper"

RSpec.describe Product, type: :model do
  describe "auditing (audited)" do
    it "records an audit on create and on update" do
      product = create(:product)
      expect(product.audits.count).to eq(1)

      product.update!(name: "Renamed Product")
      expect(product.audits.count).to eq(2)
      expect(product.audits.last.audited_changes).to have_key("name")
    end

    it "records the soft delete as a discarded_at change" do
      product = create(:product)
      product.discard
      expect(product.audits.last.audited_changes).to have_key("discarded_at")
    end
  end
end
