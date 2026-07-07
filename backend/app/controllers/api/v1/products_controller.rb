module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product, only: %i[show update destroy]

      # GET /api/v1/products?search=&active=&page=&per_page=
      def index
        products = Product
                   .search_by_name(params[:search])
                   .by_state(params[:active])
                   .order(created_at: :desc)
                   .page(params[:page])
                   .per(per_page)

        render json: {
          data: ProductBlueprint.render_as_hash(products),
          meta: pagination_meta(products)
        }
      end

      # GET /api/v1/products/:id
      def show
        render json: { data: ProductBlueprint.render_as_hash(@product) }
      end

      # POST /api/v1/products
      def create
        product = Product.create!(product_params)
        render json: { data: ProductBlueprint.render_as_hash(product) },
               status: :created,
               location: api_v1_product_url(product)
      end

      # PUT/PATCH /api/v1/products/:id
      def update
        @product.update!(product_params)
        render json: { data: ProductBlueprint.render_as_hash(@product) }
      end

      # DELETE /api/v1/products/:id
      def destroy
        @product.destroy!
        head :no_content
      end

      private

      def set_product
        @product = Product.find(params[:id])
      end

      def product_params
        params.require(:product).permit(:name, :description, :price, :stock, :sku, :active)
      end

      # Default 10 per page, capped at 100 so a client can't request an unbounded payload.
      def per_page
        @per_page ||= begin
          requested = params[:per_page].to_i
          requested = 10 if requested <= 0
          [requested, 100].min
        end
      end

      def pagination_meta(scope)
        {
          total: scope.total_count,
          page: scope.current_page,
          pages: scope.total_pages,
          per_page: per_page,
          next: scope.next_page,
          prev: scope.prev_page
        }
      end
    end
  end
end
