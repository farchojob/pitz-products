import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/product'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/** Origin that serves static assets (uploaded images) — the base URL minus the /api/vN suffix. */
export const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+\/?$/, '')

interface BackendErrorBody {
  error?: {
    status?: number
    code?: string
    message?: string
    details?: Record<string, string[]>
  }
}

/** Convert any thrown value into the consistent ApiError the UI relies on. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorBody>
    const payload = axiosError.response?.data?.error
    return {
      status: payload?.status ?? axiosError.response?.status ?? 0,
      code: payload?.code ?? 'network_error',
      message: payload?.message ?? axiosError.message ?? 'Request failed',
      fieldErrors: payload?.details ?? {},
    }
  }
  return { status: 0, code: 'unknown_error', message: 'Something went wrong', fieldErrors: {} }
}

// Every rejection reaches callers already normalized.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
