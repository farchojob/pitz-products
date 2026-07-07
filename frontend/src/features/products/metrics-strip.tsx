import type { ReactNode } from 'react'
import { useProductStats } from '@/hooks/use-products'
import { formatCompactCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const PER_PAGE = 10

function Metric({
  label,
  value,
  valueClassName,
  footnote,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
  footnote: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border bg-card px-4 py-4 shadow-sm">
      <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className={cn('text-2xl font-semibold tracking-tight tabular-nums', valueClassName)}>
        {value}
      </span>
      <div className="text-[11.5px] text-muted-foreground">{footnote}</div>
    </div>
  )
}

export function MetricsStrip() {
  const { data: stats, isPending } = useProductStats()

  if (isPending || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-2xl" />
        ))}
      </div>
    )
  }

  const pages = Math.max(Math.ceil(stats.total / PER_PAGE), 1)
  const activePct = stats.total ? Math.round((stats.active / stats.total) * 100) : 0
  const alerts = stats.out + stats.low

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Metric
        label="Total SKUs"
        value={stats.total}
        footnote={`across ${pages} page${pages === 1 ? '' : 's'}`}
      />
      <Metric
        label="Active"
        value={`${stats.active} / ${stats.total}`}
        footnote={
          <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success" style={{ width: `${activePct}%` }} />
          </div>
        }
      />
      <Metric
        label="Stock alerts"
        value={alerts}
        valueClassName={alerts > 0 ? 'text-warning' : undefined}
        footnote={
          <span>
            <span className="text-destructive">{stats.out} out</span>
            {' · '}
            <span className="text-warning">{stats.low} low</span>
          </span>
        }
      />
      <Metric
        label="Inventory value"
        value={formatCompactCurrency(stats.inventory_value)}
        footnote="at current list prices"
      />
    </div>
  )
}
