import type { MouseEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

// Keep a row's action from also triggering the row's quick-view click.
function stop(event: MouseEvent, run: () => void) {
  event.stopPropagation()
  run()
}

export function ProductTable({ products, onView, onEdit, onDelete }: Props) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm md:block">
      <Table className="min-w-[820px]">
        <caption className="sr-only">Products</caption>
        <TableHeader className="[&_th]:h-11 [&_th]:px-4 [&_th]:font-mono [&_th]:text-[10px] [&_th]:font-medium [&_th]:tracking-[0.14em] [&_th]:text-muted-foreground [&_th]:uppercase">
          <TableRow className="border-border/70 bg-muted/45 hover:bg-muted/45">
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:px-4 [&_td]:py-2.5">
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="group cursor-pointer border-border/60"
              onClick={() => onView(product)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <ProductThumb
                    src={product.image_url}
                    alt={product.name}
                    className="h-11 w-11 shrink-0 rounded-md border border-border/60"
                    iconClassName="h-5 w-5"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    {product.description && (
                      <p className="max-w-[280px] truncate text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell>
                <StockMeter stock={product.stock} />
              </TableCell>
              <TableCell>
                <StatusBadge active={product.active} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
