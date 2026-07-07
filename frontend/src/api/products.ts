import { apiClient } from '@/lib/api-client'
import type {
  Product,
  ProductListParams,
  ProductListResponse,
  ProductResponse,
} from '@/types/product'

export interface ProductPayload {
  name: string
  description?: string
  price: string
  stock: number
  sku: string
  active: boolean
}

export async function listProducts(params: ProductListParams): Promise<ProductListResponse> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
  }
  if (params.search.trim()) query.search = params.search.trim()
  if (params.active !== 'all') query.active = params.active

  const { data } = await apiClient.get<ProductListResponse>('/products', { params: query })
  return data
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get<ProductResponse>(`/products/${id}`)
  return data.data
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<ProductResponse>('/products', { product: payload })
  return data.data
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.put<ProductResponse>(`/products/${id}`, { product: payload })
  return data.data
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
