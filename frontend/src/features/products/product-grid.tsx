import type { KeyboardEvent, MouseEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export function ProductGrid({ products, onView, onEdit, onDelete }: Props) {
  const onKey = (event: KeyboardEvent, product: Product) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onView(product)
    }
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <div
            role="button"
            tabIndex={0}
            aria-label={`Quick view ${product.name}`}
            onClick={() => onView(product)}
            onKeyDown={(event) => onKey(event, product)}
            className="group flex h-full cursor-pointer gap-3.5 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ProductThumb
              src={product.image_url}
              alt={product.name}
              className="h-[92px] w-[92px] shrink-0 rounded-xl border border-border/60"
              iconClassName="h-7 w-7"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] text-muted-foreground">{product.sku}</span>
                <StatusBadge active={product.active} />
              </div>
              <p className="truncate font-semibold tracking-tight">{product.name}</p>
              <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                <span className="text-lg font-bold tracking-tight tabular-nums">
                  {formatPrice(product.price)}
                </span>
                <StockMeter stock={product.stock} />
              </div>
              <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label={`Edit ${product.name}`}
                  onClick={(event) => stop(event, () => onEdit(product))}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${product.name}`}
                  onClick={(event) => stop(event, () => onDelete(product))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
