import { apiClient } from '@/lib/api-client'
import type {
  CatalogStats,
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
  image_url: string | null
}

export async function listProducts(
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
  }
  if (params.search.trim()) query.search = params.search.trim()
  if (params.active !== 'all') query.active = params.active

  // signal comes from TanStack Query — a superseded/cancelled query aborts its request.
  const { data } = await apiClient.get<ProductListResponse>('/products', { params: query, signal })
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

export async function getProductStats(signal?: AbortSignal): Promise<CatalogStats> {
  const { data } = await apiClient.get<{ data: CatalogStats }>('/products/stats', { signal })
  return data.data
}

/** Uploads an image to the API's local folder and returns its served path. */
export async function uploadProductImage(file: File, signal?: AbortSignal): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  // FormData → axios sets multipart/form-data with the correct boundary itself.
  const { data } = await apiClient.post<{ data: { url: string } }>('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
  })
  return data.data.url
}
