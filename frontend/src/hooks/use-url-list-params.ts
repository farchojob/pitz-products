import { useCallback, useEffect, useState } from 'react'
import type { StateFilter } from '@/types/product'

interface ListParams {
  page: number
  search: string
  active: StateFilter
}

const STATE_FILTERS: StateFilter[] = ['all', 'true', 'false']

function readParams(): ListParams {
  const params = new URLSearchParams(window.location.search)
  const page = Number(params.get('page'))
  const active = params.get('active') as StateFilter | null

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get('search') ?? '',
    active: active && STATE_FILTERS.includes(active) ? active : 'all',
  }
}

function writeParams(params: ListParams) {
  // Start from the live query string so unrelated params are preserved; only manage our keys.
  const search = new URLSearchParams(window.location.search)
  if (params.page > 1) search.set('page', String(params.page))
  else search.delete('page')
  if (params.search.trim()) search.set('search', params.search.trim())
  else search.delete('search')
  if (params.active !== 'all') search.set('active', params.active)
  else search.delete('active')

  const query = search.toString()
  // replaceState (not push) so typing doesn't spam browser history.
  window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
}

/**
 * Keeps the product list state (page / search / status) in the URL query string,
 * so a refresh restores it and the view is shareable. Changing the search or filter
 * resets to page 1, and browser back/forward re-hydrates the state from the URL.
 */
export function useUrlListParams() {
  const [params, setParams] = useState<ListParams>(readParams)

  useEffect(() => {
    writeParams(params)
  }, [params])

  useEffect(() => {
    const onPopState = () => setParams(readParams())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setPage = useCallback((page: number) => setParams((prev) => ({ ...prev, page })), [])
  const setSearch = useCallback((search: string) => setParams((prev) => ({ ...prev, search, page: 1 })), [])
  const setActive = useCallback((active: StateFilter) => setParams((prev) => ({ ...prev, active, page: 1 })), [])
  const reset = useCallback(() => setParams({ page: 1, search: '', active: 'all' }), [])

  return { ...params, setPage, setSearch, setActive, reset }
}
