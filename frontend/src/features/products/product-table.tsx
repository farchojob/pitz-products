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
import { cn } from '@/lib/utils'
import { formatDate, formatPrice } from '@/lib/format'
import type { Product } from '@/types/product'
import { ProductThumb } from './product-thumb'
import { StatusBadge } from './status-badge'

interface Props {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

// Colour stock by health so a depleted catalog jumps out: red at zero, amber when low.
function StockCell({ stock }: { stock: number }) {
  const tone = stock === 0 ? 'text-destructive' : stock <= 5 ? 'text-warning' : 'text-foreground'
  return (
    <span className={cn('inline-flex items-center gap-1.5 tabular-nums', tone)}>
      {stock}
      {stock === 0 && (
        <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">out</span>
      )}
      {stock > 0 && stock <= 5 && (
        <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">low</span>
      )}
    </span>
  )
}

export function ProductTable({ products, onEdit, onDelete }: Props) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm md:block">
      <Table>
        <caption className="sr-only">Products</caption>
        <TableHeader className="[&_th]:h-11 [&_th]:px-4 [&_th]:text-[11px] [&_th]:font-medium [&_th]:tracking-wider [&_th]:text-muted-foreground [&_th]:uppercase">
          <TableRow className="border-border/70 bg-muted/40 hover:bg-muted/40">
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:px-4 [&_td]:py-3">
          {products.map((product) => (
            <TableRow key={product.id} className="group border-border/60">
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
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {product.sku}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell className="text-right">
                <StockCell stock={product.stock} />
              </TableCell>
              <TableCell>
                <StatusBadge active={product.active} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(product.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
