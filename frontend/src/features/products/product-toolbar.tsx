import type { ReactNode } from 'react'
import { LayoutGrid, Loader2, Rows3, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/hooks/use-view-mode'
import type { StateFilter } from '@/types/product'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  active: StateFilter
  onActiveChange: (value: StateFilter) => void
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  isFetching: boolean
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function ProductToolbar({
  search,
  onSearchChange,
  active,
  onActiveChange,
  view,
  onViewChange,
  isFetching,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {isFetching && (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name…"
          className="h-10 pl-9"
          aria-label="Search products by name"
        />
      </div>
      <div className="flex items-center gap-2.5">
        <Select value={active} onValueChange={(value) => onActiveChange(value as StateFilter)}>
          <SelectTrigger className="h-10 flex-1 sm:w-44 sm:flex-none" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="inline-flex h-10 items-center rounded-lg border border-input bg-card p-1">
          <ViewButton
            active={view === 'table'}
            label="Table view"
            onClick={() => onViewChange('table')}
          >
            <Rows3 className="h-4 w-4" />
          </ViewButton>
          <ViewButton
            active={view === 'grid'}
            label="Grid view"
            onClick={() => onViewChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </ViewButton>
        </div>
      </div>
    </div>
  )
}
