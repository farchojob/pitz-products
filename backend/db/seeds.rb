# Idempotent seeds — safe to run repeatedly (find_or_create_by! on the unique SKU).
# Deliberately Faker-free so `rails db:seed` also works on the deployed demo,
# where Faker (a dev/test gem) is not available.
#
# Generates 55 products (≈6 pages at 10/page) with a mix of active/inactive and
# some zero-stock items, so pagination, filtering and search are all demoable.

ADJECTIVES = %w[Premium Classic Rugged Compact Deluxe Eco Smart Portable Industrial Precision].freeze
NOUNS      = %w[Widget Gadget Drill Sensor Bracket Cable Adapter Valve Bearing Toolkit Fastener Module].freeze

created = 0
55.times do |i|
  sku = "SKU-#{(i + 1).to_s.rjust(4, "0")}"
  product = Product.find_or_create_by!(sku: sku) do |p|
    p.name        = "#{ADJECTIVES[i % ADJECTIVES.size]} #{NOUNS[i % NOUNS.size]} #{i + 1}"
    p.description  = "High-quality #{NOUNS[i % NOUNS.size].downcase} for everyday use. Unit ##{i + 1}."
    p.price        = (rand(1.0..999.0)).round(2)
    p.stock        = i.even? ? rand(1..500) : [0, rand(1..500)].sample
    p.active       = (i % 3 != 0) # ~1/3 inactive
  end
  created += 1 if product.previously_new_record?
end

puts "Seeds complete. Created #{created} new products (#{Product.count} total)."
