import type { ReactNode } from 'react'
import { AlertTriangle, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="overflow-hidden rounded-xl border border-border/70 bg-card"
    >
      <div className="border-b border-border/60 bg-muted/40 px-4 py-3.5">
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="hidden h-4 w-20 sm:block" />
            <Skeleton className="ml-auto h-4 w-14" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatePanel({
  icon,
  tone = 'default',
  title,
  description,
  action,
}: {
  icon: ReactNode
  tone?: 'default' | 'destructive'
  title: string
  description: string
  action: ReactNode
}) {
  const dashed = tone === 'default'
  return (
    <div
      className={
        dashed
          ? 'flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/40 py-16 text-center'
          : 'flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center'
      }
    >
      <div
        className={
          tone === 'destructive'
            ? 'flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive'
            : 'flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-inset ring-border'
        }
      >
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
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
    <StatePanel
      icon={<PackageOpen className="h-7 w-7" />}
      title={hasFilters ? 'No products match your filters' : 'No products yet'}
      description={
        hasFilters
          ? 'Try a different search term or clear the filters.'
          : 'Create your first product to get started.'
      }
      action={
        hasFilters ? (
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <Button onClick={onNew}>New product</Button>
        )
      }
    />
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StatePanel
      tone="destructive"
      icon={<AlertTriangle className="h-7 w-7" />}
      title="Could not load products"
      description={message}
      action={
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  )
}
