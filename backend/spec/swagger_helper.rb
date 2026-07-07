# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  config.openapi_root = Rails.root.join('swagger').to_s

  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'PITZ Product Manager API',
        version: 'v1',
        description: 'CRUD API for managing products (pagination, search, filtering, validation).'
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local' },
        { url: 'https://pitz-products-api.onrender.com', description: 'Render' }
      ],
      paths: {},
      components: {
        schemas: {
          Product: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'Premium Widget' },
              description: { type: :string, nullable: true },
              price: { type: :string, description: 'Decimal serialized as a string', example: '19.99' },
              stock: { type: :integer, example: 42 },
              sku: { type: :string, example: 'SKU-0001' },
              active: { type: :boolean, example: true },
              image_url: { type: :string, nullable: true, example: '/uploads/seed/1.jpg' },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: %w[id name price stock sku active]
          },
          ProductInput: {
            type: :object,
            properties: {
              name: { type: :string, minLength: 3, maxLength: 100 },
              description: { type: :string, maxLength: 1000, nullable: true },
              price: { type: :string, description: 'Decimal > 0' },
              stock: { type: :integer, minimum: 0 },
              sku: { type: :string, description: 'Uppercase letters, numbers and hyphens' },
              active: { type: :boolean },
              image_url: { type: :string, nullable: true, description: 'Local /uploads path or an http(s) URL' }
            },
            required: %w[name price stock sku]
          },
          CatalogStats: {
            type: :object,
            properties: {
              total: { type: :integer },
              active: { type: :integer },
              out: { type: :integer, description: 'stock = 0' },
              low: { type: :integer, description: 'stock between 1 and 5' },
              inventory_value: { type: :string, description: 'SUM(price * stock), serialized as a string' }
            }
          },
          PaginationMeta: {
            type: :object,
            properties: {
              total: { type: :integer },
              page: { type: :integer },
              pages: { type: :integer },
              per_page: { type: :integer },
              next: { type: :integer, nullable: true },
              prev: { type: :integer, nullable: true }
            }
          },
          Error: {
            type: :object,
            properties: {
              error: {
                type: :object,
                properties: {
                  status: { type: :integer },
                  code: { type: :string },
                  message: { type: :string },
                  details: { type: :object, additionalProperties: { type: :array, items: { type: :string } } }
                }
              }
            }
          }
        }
      }
    }
  }

  config.openapi_format = :yaml
end
