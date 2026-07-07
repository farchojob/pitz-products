import { lazy, Suspense, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useProducts } from '@/hooks/use-products'
import { useUrlListParams } from '@/hooks/use-url-list-params'
import { useViewMode } from '@/hooks/use-view-mode'
import type { Product } from '@/types/product'
import { EmptyState, ErrorState, ListSkeleton } from './product-states'
import { ProductCardList } from './product-card-list'
import { ProductGrid } from './product-grid'
import { ProductPagination } from './product-pagination'
import { ProductTable } from './product-table'
import { ProductToolbar } from './product-toolbar'

// Dialogs are code-split — their chunk loads the first time a user opens one.
const ProductFormDialog = lazy(() =>
  import('./product-form-dialog').then((module) => ({ default: module.ProductFormDialog })),
)
const DeleteProductDialog = lazy(() =>
  import('./delete-product-dialog').then((module) => ({ default: module.DeleteProductDialog })),
)

const PER_PAGE = 10
// Wait for a deliberate pause in typing before querying, so a request doesn't fire mid-word.
const SEARCH_DEBOUNCE_MS = 400

export function ProductsPage() {
  // page / search / status live in the URL (shareable + survives refresh).
  const { page, search, active, setPage, setSearch, setActive, reset } = useUrlListParams()
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const [view, setView] = useViewMode()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  // Once opened, keep the (lazy) form dialog mounted so its close animation can play.
  const [formMounted, setFormMounted] = useState(false)

  const { data, isPending, isError, error, refetch, isFetching } = useProducts({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    active,
  })

  const openCreate = () => {
    setEditing(null)
    setFormMounted(true)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setFormMounted(true)
    setFormOpen(true)
  }

  const hasFilters = debouncedSearch.trim() !== '' || active !== 'all'
  const total = data?.meta.total
  const subtitle =
    total === undefined
      ? 'Manage and track your catalog'
      : `${total} ${total === 1 ? 'product' : 'products'}${hasFilters ? ' matching' : ' in your catalog'}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground tabular-nums">{subtitle}</p>
        </div>
        <Button size="lg" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New product
        </Button>
      </div>

      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        active={active}
        onActiveChange={setActive}
        view={view}
        onViewChange={setView}
        isFetching={isFetching}
      />

      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={reset} onNew={openCreate} />
      ) : (
        <div className="space-y-4 duration-300 animate-in fade-in-0 slide-in-from-bottom-1">
          {view === 'table' ? (
            <>
              <ProductTable products={data.data} onEdit={openEdit} onDelete={setDeleting} />
              <ProductCardList products={data.data} onEdit={openEdit} onDelete={setDeleting} />
            </>
          ) : (
            <ProductGrid products={data.data} onEdit={openEdit} onDelete={setDeleting} />
          )}
          <ProductPagination meta={data.meta} onPageChange={setPage} />
        </div>
      )}

      <Suspense fallback={null}>
        {formMounted && <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />}
        {deleting && (
          <DeleteProductDialog
            product={deleting}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setDeleting(null)
            }}
          />
        )}
      </Suspense>
    </div>
  )
}
