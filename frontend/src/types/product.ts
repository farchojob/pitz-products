export interface Product {
  id: number
  name: string
  description: string | null
  /** Decimal serialized as a string by the API to preserve cents. */
  price: string
  stock: number
  sku: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  total: number
  page: number
  pages: number
  per_page: number
  next: number | null
  prev: number | null
}

export interface ProductListResponse {
  data: Product[]
  meta: PaginationMeta
}

export interface ProductResponse {
  data: Product
}

/** Normalized error shape every request rejects with (see api-client). */
export interface ApiError {
  status: number
  code: string
  message: string
  fieldErrors: Record<string, string[]>
}

export type StateFilter = 'all' | 'true' | 'false'

export interface ProductListParams {
  page: number
  perPage: number
  search: string
  active: StateFilter
}
