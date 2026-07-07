import type { MouseEvent } from 'react'
import { Loader2 } from 'lucide-react'
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
    deleteProduct.mutate(product, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={product !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes {product ? `"${product.name}"` : 'this product'}. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProduct.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteProduct.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteProduct.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
