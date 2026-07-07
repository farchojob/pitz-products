import { cn } from '@/lib/utils'

// A pill with a leading status dot — reads at a glance in a dense table.
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        active
          ? 'border-success/25 bg-success/10 text-success'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-success' : 'bg-muted-foreground/50')}
        aria-hidden
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
