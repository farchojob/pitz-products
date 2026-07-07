import { Badge } from '@/components/ui/badge'

export function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        Active
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      Inactive
    </Badge>
  )
}
