import { cn } from '@/lib/utils'

const TICKS = 10
const FULL_AT = 250 // stock that fills every tick

// Stock health: 0 = out (destructive), 1–5 = low (warning), else healthy (success).
function health(stock: number) {
  if (stock === 0) return { fill: 'bg-destructive', text: 'text-destructive', chip: 'OUT', chipCls: 'bg-destructive/12 text-destructive' }
  if (stock <= 5) return { fill: 'bg-warning', text: 'text-warning', chip: 'LOW', chipCls: 'bg-warning/15 text-warning' }
  return { fill: 'bg-success', text: 'text-foreground', chip: null, chipCls: '' }
}

export function StockMeter({ stock, className }: { stock: number; className?: string }) {
  const h = health(stock)
  const filled = stock === 0 ? 0 : Math.min(Math.max(Math.round((stock / FULL_AT) * TICKS), 1), TICKS)

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      aria-label={`${stock} in stock${h.chip ? ` (${h.chip.toLowerCase()})` : ''}`}
    >
      <div className="flex items-center gap-[2px]" aria-hidden>
        {Array.from({ length: TICKS }).map((_, i) => (
          <span
            key={i}
            className={cn('h-2.5 w-[3px] rounded-[2px]', i < filled ? h.fill : 'bg-tick-off')}
          />
        ))}
      </div>
      <span className={cn('text-[13px] tabular-nums', h.text)} aria-hidden>
        {stock}
      </span>
      {h.chip && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase',
            h.chipCls,
          )}
          aria-hidden
        >
          {h.chip}
        </span>
      )}
    </div>
  )
}
