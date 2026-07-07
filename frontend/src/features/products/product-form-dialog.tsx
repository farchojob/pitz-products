import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { productFormSchema } from '@/lib/schemas/product'
import type { ProductFormInput, ProductFormValues } from '@/lib/schemas/product'
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-product-mutations'
import type { ProductPayload } from '@/api/products'
import type { Product } from '@/types/product'

const EMPTY_VALUES: ProductFormInput = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  sku: '',
  active: true,
}

const FIELD_NAMES: ReadonlyArray<keyof ProductFormInput> = [
  'name',
  'description',
  'price',
  'stock',
  'sku',
  'active',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const isEditing = product !== null
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(product?.id ?? 0)
  const isSubmitting = createProduct.isPending || updateProduct.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_VALUES,
  })

  // Populate on open (edit -> product values, create -> empty).
  useEffect(() => {
    if (!open) return
    reset(
      product
        ? {
            name: product.name,
            description: product.description ?? '',
            price: Number(product.price),
            stock: product.stock,
            sku: product.sku,
            active: product.active,
          }
        : EMPTY_VALUES,
    )
  }, [open, product, reset])

  const onSubmit = (values: ProductFormValues) => {
    const payload: ProductPayload = {
      name: values.name,
      description: values.description ? values.description : undefined,
      price: String(values.price),
      stock: values.stock,
      sku: values.sku,
      active: values.active,
    }

    const mutation = isEditing ? updateProduct : createProduct
    mutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false)
        reset(EMPTY_VALUES)
      },
      onError: (error) => {
        const entries = Object.entries(error.fieldErrors)
        if (entries.length === 0) {
          toast.error(error.message)
          return
        }
        for (const [field, messages] of entries) {
          if (FIELD_NAMES.includes(field as keyof ProductFormInput)) {
            setError(field as keyof ProductFormInput, {
              type: 'server',
              message: messages.join(' '),
            })
          } else {
            toast.error(messages.join(' '))
          }
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit product' : 'New product'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the product details below.'
              : 'Fill in the details to add a product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && (
              <p role="alert" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="ABC-123"
              className="font-mono"
              aria-invalid={Boolean(errors.sku)}
              {...register('sku')}
            />
            {errors.sku && (
              <p role="alert" className="text-sm text-destructive">
                {errors.sku.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.price)}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                min="0"
                aria-invalid={Boolean(errors.stock)}
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} aria-invalid={Boolean(errors.description)} {...register('description')} />
            {errors.description && (
              <p role="alert" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="active">Active</Label>
              <p className="text-sm text-muted-foreground">Inactive products are hidden from the active filter.</p>
            </div>
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
