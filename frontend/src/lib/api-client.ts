import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/product'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

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
