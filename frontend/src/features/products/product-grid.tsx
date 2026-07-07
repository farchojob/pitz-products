import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types/product'
import { ProductThumb } from './product-thumb'
import { StatusBadge } from './status-badge'

interface Props {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductGrid({ products, onEdit, onDelete }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            {/* Product image with a no-media fallback rendered inside the band. */}
            <div className="relative h-32 border-b border-border/60">
              <ProductThumb
                src={product.image_url}
                alt={product.name}
                className="h-full w-full"
                iconClassName="h-8 w-8"
              />
              <div className="absolute top-2 right-2">
                <StatusBadge active={product.active} />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <span className="w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {product.sku}
              </span>
              <p className="line-clamp-2 min-h-[2.5rem] leading-snug font-medium">{product.name}</p>
              <div className="mt-auto flex items-end justify-between pt-2">
                <div>
                  <p className="text-lg font-semibold tabular-nums">{formatPrice(product.price)}</p>
                  <p
                    className={cn(
                      'text-xs text-muted-foreground tabular-nums',
                      product.stock === 0 && 'text-destructive',
                      product.stock > 0 && product.stock <= 5 && 'text-warning',
                    )}
                  >
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                  </p>
                </div>
                <div className="flex gap-1 opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
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
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
