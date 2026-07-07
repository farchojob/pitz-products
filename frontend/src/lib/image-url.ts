import { API_ORIGIN } from '@/lib/api-client'

/**
 * Resolve a product's stored image reference to a loadable URL. Absolute URLs
 * pass through; a local `/uploads/...` path is served by the API host, so it's
 * prefixed with the API origin (works across local + deployed environments).
 * Returns null when there's no image, so callers render the no-media fallback.
 */
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}
