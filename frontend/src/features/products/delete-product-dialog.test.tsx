import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteProductDialog } from './delete-product-dialog'
import { renderWithClient } from '@/test/utils'
import { seedProducts } from '@/test/handlers'
import type { Product } from '@/types/product'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const product: Product = {
  id: 1,
  name: 'Deletable Widget',
  description: null,
  price: '10.00',
  stock: 1,
  sku: 'DEL-1',
  active: true,
  created_at: '2026-07-06T00:00:00.000Z',
  updated_at: '2026-07-06T00:00:00.000Z',
}

describe('DeleteProductDialog', () => {
  it('shows a confirmation naming the product', () => {
    renderWithClient(<DeleteProductDialog product={product} onOpenChange={() => {}} />)

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText(/deletable widget/i)).toBeInTheDocument()
  })

  it('renders nothing when there is no product', () => {
    renderWithClient(<DeleteProductDialog product={null} onOpenChange={() => {}} />)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('deletes on confirm, then closes and toasts', async () => {
    seedProducts([{ sku: 'DEL-1', name: 'Deletable Widget' }])
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithClient(<DeleteProductDialog product={product} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(toast.success).toHaveBeenCalled()
  })
})
