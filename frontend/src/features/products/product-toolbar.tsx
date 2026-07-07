import { Loader2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StateFilter } from '@/types/product'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  active: StateFilter
  onActiveChange: (value: StateFilter) => void
  onNew: () => void
  isFetching: boolean
}

export function ProductToolbar({
  search,
  onSearchChange,
  active,
  onActiveChange,
  onNew,
  isFetching,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {isFetching && (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name..."
          className="pl-9"
          aria-label="Search products by name"
        />
      </div>
      <Select value={active} onValueChange={(value) => onActiveChange(value as StateFilter)}>
        <SelectTrigger className="sm:w-40" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onNew}>
        <Plus className="h-4 w-4" />
        New product
      </Button>
    </div>
  )
}
