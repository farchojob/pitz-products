require 'swagger_helper'

# This spec documents the API (rswag DSL) and generates swagger/v1/swagger.yaml
# via `rake rswag:specs:swaggerize`. Correctness is covered by products_spec.rb.
RSpec.describe 'Products', type: :request, openapi_spec: 'v1/swagger.yaml' do
  path '/api/v1/products' do
    get 'Lists products (paginated)' do
      tags 'Products'
      produces 'application/json'
      parameter name: :page, in: :query, type: :integer, required: false, description: 'Page number (default 1)'
      parameter name: :per_page, in: :query, type: :integer, required: false, description: 'Items per page (default 10, max 100)'
      parameter name: :search, in: :query, type: :string, required: false, description: 'Case-insensitive name search'
      parameter name: :active, in: :query, type: :string, enum: %w[true false], required: false, description: 'Filter by status'

      response 200, 'a paginated list' do
        schema type: :object,
               properties: {
                 data: { type: :array, items: { '$ref' => '#/components/schemas/Product' } },
                 meta: { '$ref' => '#/components/schemas/PaginationMeta' }
               }
        run_test!
      end
    end

    post 'Creates a product' do
      tags 'Products'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :product, in: :body, schema: {
        type: :object,
        properties: { product: { '$ref' => '#/components/schemas/ProductInput' } },
        required: %w[product]
      }

      response 201, 'created' do
        let(:product) { { product: { name: 'New Widget', description: 'A product', price: '19.99', stock: 5, sku: 'NEW-1', active: true } } }
        schema type: :object, properties: { data: { '$ref' => '#/components/schemas/Product' } }
        run_test!
      end

      response 422, 'validation error' do
        let(:product) { { product: { name: 'ab', price: '0', sku: 'bad sku!' } } }
        schema '$ref' => '#/components/schemas/Error'
        run_test!
      end
    end
  end

  path '/api/v1/products/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'Product id'

    get 'Fetches a product' do
      tags 'Products'
      produces 'application/json'

      response 200, 'found' do
        let(:id) { create(:product).id }
        schema type: :object, properties: { data: { '$ref' => '#/components/schemas/Product' } }
        run_test!
      end

      response 404, 'not found' do
        let(:id) { 999_999 }
        schema '$ref' => '#/components/schemas/Error'
        run_test!
      end
    end

    put 'Updates a product' do
      tags 'Products'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :product, in: :body, schema: {
        type: :object,
        properties: { product: { '$ref' => '#/components/schemas/ProductInput' } }
      }

      response 200, 'updated' do
        let(:id) { create(:product).id }
        let(:product) { { product: { name: 'Updated Name' } } }
        schema type: :object, properties: { data: { '$ref' => '#/components/schemas/Product' } }
        run_test!
      end

      response 404, 'not found' do
        let(:id) { 999_999 }
        let(:product) { { product: { name: 'X' } } }
        schema '$ref' => '#/components/schemas/Error'
        run_test!
      end

      response 422, 'validation error' do
        let(:id) { create(:product).id }
        let(:product) { { product: { price: '0' } } }
        schema '$ref' => '#/components/schemas/Error'
        run_test!
      end
    end

    delete 'Deletes a product (soft delete)' do
      tags 'Products'

      response 204, 'no content' do
        let(:id) { create(:product).id }
        run_test!
      end
    end
  end
end
