import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate, formatPrice } from '@/lib/format'
import type { Product } from '@/types/product'
import { ProductThumb } from './product-thumb'
import { StatusBadge } from './status-badge'
import { StockMeter } from './stock-meter'

interface Props {
  product: Product | null
  onOpenChange: (open: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

// Read-only detail modal: image on the left, facts + actions on the right.
export function ProductQuickView({ product, onOpenChange, onEdit, onDelete }: Props) {
  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
        {product && (
          <div className="grid sm:grid-cols-2">
            <div className="relative min-h-[200px] bg-thumb-bg sm:min-h-[320px]">
              <ProductThumb
                src={product.image_url}
                alt={product.name}
                className="h-full w-full"
                iconClassName="h-10 w-10"
              />
            </div>

            <div className="flex flex-col gap-3.5 p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                <StatusBadge active={product.active} />
              </div>

              <DialogTitle className="text-2xl leading-tight font-bold tracking-tight">
                {product.name}
              </DialogTitle>

              {product.description ? (
                <DialogDescription className="text-sm leading-relaxed">
                  {product.description}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">Product details</DialogDescription>
              )}

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  {formatPrice(product.price)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">USD</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Inventory</span>
                <StockMeter stock={product.stock} />
              </div>

              <p className="text-xs text-muted-foreground">
                Last updated {formatDate(product.updated_at)}
              </p>

              <div className="mt-auto flex gap-2 pt-2">
                <Button className="flex-1" onClick={() => onEdit(product)}>
                  Edit product
                </Button>
                <Button variant="destructive" onClick={() => onDelete(product)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
