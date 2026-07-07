FactoryBot.define do
  factory :product do
    sequence(:sku) { |n| "SKU-#{n.to_s.rjust(4, "0")}" }
    name { "Test Product" }
    description { "A solid, well-made test product." }
    price { 19.99 }
    stock { 42 }
    active { true }
    image_url { nil }

    trait :inactive do
      active { false }
    end

    trait :zero_stock do
      stock { 0 }
    end

    trait :with_image do
      image_url { "/uploads/seed/1.jpg" }
    end
  end
end
