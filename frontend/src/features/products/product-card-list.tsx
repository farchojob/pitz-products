import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/product'
import { StatusBadge } from './status-badge'

interface Props {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCardList({ products, onEdit, onDelete }: Props) {
  return (
    <ul className="space-y-3 md:hidden">
      {products.map((product) => (
        <li key={product.id}>
          <Card className="transition-colors hover:border-border">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1.5">
                <p className="truncate font-medium">{product.name}</p>
                <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {product.sku}
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-sm">
                  <StatusBadge active={product.active} />
                  <span className="font-medium tabular-nums">{formatPrice(product.price)}</span>
                  <span
                    className={cn(
                      'text-muted-foreground tabular-nums',
                      product.stock === 0 && 'text-destructive',
                      product.stock > 0 && product.stock <= 5 && 'text-warning',
                    )}
                  >
                    · {product.stock} in stock
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${product.name}`}
                  onClick={() => onEdit(product)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${product.name}`}
                  onClick={() => onDelete(product)}
                  className="hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
