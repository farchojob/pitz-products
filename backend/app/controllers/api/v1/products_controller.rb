module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product, only: %i[show update destroy]

      # GET /api/v1/products?search=&active=&page=&per_page=
      def index
        products = Product
                   .kept
                   .search_by_name(params[:search])
                   .by_state(params[:active])
                   .order(created_at: :desc, id: :desc)
                   .page(params[:page])
                   .per(per_page)

        # When the requested page is past the last one, skip loading records — this
        # avoids a huge OFFSET scan for something like ?page=99999999 (the data is
        # empty anyway). The COUNT for the metadata still runs and is cheap.
        records = products.out_of_range? ? [] : products

        render json: {
          data: ProductBlueprint.render_as_hash(records),
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
        @product.discard # soft delete — retains the row with discarded_at set
        head :no_content
      end

      private

      def set_product
        # kept-only: a soft-deleted product reads as gone (404).
        @product = Product.kept.find(params[:id])
      end

      def product_params
        params.require(:product).permit(:name, :description, :price, :stock, :sku, :active)
      end

      # Default 10 per page, capped at 100 so a client can't request an unbounded payload.
      def per_page
        @per_page ||= begin
          requested = params[:per_page].to_i
          requested = 10 if requested <= 0
          [ requested, 100 ].min
        end
      end

      def pagination_meta(scope)
        {
          total: scope.total_count,
          page: scope.current_page,
          pages: scope.total_pages,
          per_page: per_page,
          next: scope.next_page,
          prev: previous_page_for(scope)
        }
      end

      # Beyond the last page there is no Kaminari prev_page; point the client back to
      # the last real page so a meta-only consumer can always recover.
      def previous_page_for(scope)
        return scope.prev_page unless scope.out_of_range?

        scope.total_pages.positive? ? scope.total_pages : nil
      end
    end
  end
end
