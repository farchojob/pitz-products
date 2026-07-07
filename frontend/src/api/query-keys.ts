import type { ProductListParams } from '@/types/product'

/** Centralized, typed query keys. List keys encode every server param so the
 *  cache is correct by construction and mutations invalidate all list variants. */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
}
