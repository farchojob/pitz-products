import type { KeyboardEvent, MouseEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/product'
import { ProductThumb } from './product-thumb'
import { StatusBadge } from './status-badge'
import { StockMeter } from './stock-meter'

interface Props {
  products: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function stop(event: MouseEvent, run: () => void) {
  event.stopPropagation()
  run()
}

export function ProductCardList({ products, onView, onEdit, onDelete }: Props) {
  const onKey = (event: KeyboardEvent, product: Product) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onView(product)
    }
  }

  return (
    <ul className="space-y-3 md:hidden">
      {products.map((product) => (
        <li key={product.id}>
          <Card className="transition-colors hover:border-border">
            <CardContent
              role="button"
              tabIndex={0}
              aria-label={`Quick view ${product.name}`}
              onClick={() => onView(product)}
              onKeyDown={(event) => onKey(event, product)}
              className="flex cursor-pointer items-start gap-3 p-3"
            >
              <ProductThumb
                src={product.image_url}
                alt={product.name}
                className="h-16 w-16 shrink-0 rounded-lg border border-border/60"
                iconClassName="h-6 w-6"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] text-muted-foreground">{product.sku}</span>
                  <StatusBadge active={product.active} />
                </div>
                <p className="truncate font-medium">{product.name}</p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="font-semibold tabular-nums">{formatPrice(product.price)}</span>
                  <StockMeter stock={product.stock} />
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${product.name}`}
                  onClick={(event) => stop(event, () => onEdit(product))}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${product.name}`}
                  onClick={(event) => stop(event, () => onDelete(product))}
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
