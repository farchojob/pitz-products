import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginationMeta } from '@/types/product'

export function ProductPagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.per_page + 1
  const to = Math.min(meta.page * meta.per_page, meta.total)

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-mono text-xs tracking-wide text-muted-foreground tabular-nums">
        {from}&ndash;{to} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={meta.prev === null}
          onClick={() => meta.prev !== null && onPageChange(meta.prev)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <span className="px-1 font-mono text-xs text-muted-foreground tabular-nums">
          {meta.page} / {Math.max(meta.pages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={meta.next === null}
          onClick={() => meta.next !== null && onPageChange(meta.next)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
