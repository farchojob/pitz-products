import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProduct, deleteProduct, updateProduct } from '@/api/products'
import type { ProductPayload } from '@/api/products'
import { productKeys } from '@/api/query-keys'
import type { ApiError, Product } from '@/types/product'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, ApiError, ProductPayload>({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
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
      toast.success(`Updated "${product.name}"`)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, Product>({
    mutationFn: (product) => deleteProduct(product.id),
    onSuccess: (_result, product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success(`Deleted "${product.name}"`)
    },
    onError: (error) => {
      toast.error(error.message || 'Could not delete product')
    },
  })
}
