import { useQuery } from '@tanstack/react-query'
import { getProduct } from '@/api/products'
import { productKeys } from '@/api/query-keys'
import type { ApiError, Product } from '@/types/product'

export function useProduct(id: number | null) {
  return useQuery<Product, ApiError>({
    queryKey: productKeys.detail(id ?? 0),
    queryFn: () => getProduct(id as number),
    enabled: id !== null,
  })
}
