import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listProducts } from '@/api/products'
import { productKeys } from '@/api/query-keys'
import type { ApiError, ProductListParams, ProductListResponse } from '@/types/product'

export function useProducts(params: ProductListParams) {
  return useQuery<ProductListResponse, ApiError>({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => listProducts(params, signal),
    // Keep the previous page visible while the next loads — no empty flash.
    placeholderData: keepPreviousData,
  })
}
