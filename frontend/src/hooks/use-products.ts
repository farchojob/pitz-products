import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProductStats, listProducts } from '@/api/products'
import { productKeys } from '@/api/query-keys'
import type {
  ApiError,
  CatalogStats,
  ProductListParams,
  ProductListResponse,
} from '@/types/product'

export function useProducts(params: ProductListParams) {
  return useQuery<ProductListResponse, ApiError>({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => listProducts(params, signal),
    // Keep the previous page visible while the next loads — no empty flash.
    placeholderData: keepPreviousData,
  })
}

/** Whole-catalog KPIs for the metrics strip; invalidated by product mutations. */
export function useProductStats() {
  return useQuery<CatalogStats, ApiError>({
    queryKey: productKeys.stats(),
    queryFn: ({ signal }) => getProductStats(signal),
    staleTime: 30_000,
  })
}
