import type { MouseEvent } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteProduct } from '@/hooks/use-product-mutations'
import type { Product } from '@/types/product'

interface Props {
  product: Product | null
  onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({ product, onOpenChange }: Props) {
  const deleteProduct = useDeleteProduct()

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!product) return
    // Optimistic: fire the delete and close immediately — the row is already gone;
    // a failure rolls it back and shows an error toast (see useDeleteProduct).
    deleteProduct.mutate(product)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={product !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes {product ? `"${product.name}"` : 'this product'} from the catalog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
