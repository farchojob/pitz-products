import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProduct, deleteProduct, updateProduct } from '@/api/products'
import type { ProductPayload } from '@/api/products'
import { productKeys } from '@/api/query-keys'
import type { ApiError, Product, ProductListResponse } from '@/types/product'

type ListSnapshot = Array<[QueryKey, ProductListResponse | undefined]>

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, ApiError, ProductPayload>({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      toast.success(`Created "${product.name}"`)
    },
  })
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()
  return useMutation<Product, ApiError, ProductPayload>({
    mutationFn: (payload) => updateProduct(id, payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
      toast.success(`Updated "${product.name}"`)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, Product, { previous: ListSnapshot }>({
    mutationFn: (product) => deleteProduct(product.id),
    // Optimistically remove the row from every cached list, remembering the state to roll back to.
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })
      const previous = queryClient.getQueriesData<ProductListResponse>({ queryKey: productKeys.lists() })
      queryClient.setQueriesData<ProductListResponse>({ queryKey: productKeys.lists() }, (old) =>
        old
          ? {
              ...old,
              data: old.data.filter((item) => item.id !== product.id),
              meta: { ...old.meta, total: Math.max(old.meta.total - 1, 0) },
            }
          : old,
      )
      return { previous }
    },
    onError: (error, _product, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(error.message || 'Could not delete product')
    },
    onSuccess: (_result, product) => {
      toast.success(`Deleted "${product.name}"`)
    },
    // Re-sync with the server regardless of outcome.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}
