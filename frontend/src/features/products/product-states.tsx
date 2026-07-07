import { AlertTriangle, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ListSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="hidden h-5 w-24 sm:block" />
          <Skeleton className="ml-auto h-5 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  hasFilters,
  onClear,
  onNew,
}: {
  hasFilters: boolean
  onClear: () => void
  onNew: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <PackageOpen className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">{hasFilters ? 'No products match your filters' : 'No products yet'}</p>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'Create your first product to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button onClick={onNew}>New product</Button>
      )}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div className="space-y-1">
        <p className="font-medium">Could not load products</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
