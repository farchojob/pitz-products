import { lazy, Suspense, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useProducts } from '@/hooks/use-products'
import { useUrlListParams } from '@/hooks/use-url-list-params'
import type { Product } from '@/types/product'
import { EmptyState, ErrorState, ListSkeleton } from './product-states'
import { ProductCardList } from './product-card-list'
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

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const { data, isPending, isError, error, refetch, isFetching } = useProducts({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    active,
  })

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setFormOpen(true)
  }

  const hasFilters = debouncedSearch.trim() !== '' || active !== 'all'

  return (
    <div className="space-y-4">
      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        active={active}
        onActiveChange={setActive}
        onNew={openCreate}
        isFetching={isFetching}
      />

      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={reset} onNew={openCreate} />
      ) : (
        <>
          <ProductTable products={data.data} onEdit={openEdit} onDelete={setDeleting} />
          <ProductCardList products={data.data} onEdit={openEdit} onDelete={setDeleting} />
          <ProductPagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <Suspense fallback={null}>
        {formOpen && <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />}
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
