import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductFormDialog } from './product-form-dialog'
import { renderWithClient } from '@/test/utils'
import { seedProducts } from '@/test/handlers'
import type { Product } from '@/types/product'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'New Gadget')
  await user.type(screen.getByLabelText('SKU'), 'new-1')
  const price = screen.getByLabelText('Price')
  await user.clear(price)
  await user.type(price, '19.99')
  const stock = screen.getByLabelText('Stock')
  await user.clear(stock)
  await user.type(stock, '7')
}

describe('ProductFormDialog — create', () => {
  it('keeps submit disabled and surfaces validation errors', async () => {
    const user = userEvent.setup()
    renderWithClient(<ProductFormDialog open onOpenChange={() => {}} product={null} />)

    expect(screen.getByRole('button', { name: /create product/i })).toBeDisabled()

    await user.type(screen.getByLabelText('Name'), 'ab')
    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create product/i })).toBeDisabled()
  })

  it('validates the SKU format (matches the backend regex)', async () => {
    const user = userEvent.setup()
    renderWithClient(<ProductFormDialog open onOpenChange={() => {}} product={null} />)

    await user.type(screen.getByLabelText('SKU'), 'ab c')
    expect(await screen.findByText(/uppercase letters, numbers and hyphens/i)).toBeInTheDocument()
  })

  it('creates a product then closes and toasts', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithClient(<ProductFormDialog open onOpenChange={onOpenChange} product={null} />)

    await fillValidForm(user)
    const submit = screen.getByRole('button', { name: /create product/i })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(toast.success).toHaveBeenCalled()
  })

  it('maps a 422 uniqueness error onto the SKU field', async () => {
    seedProducts([{ sku: 'DUP-1', name: 'Existing' }])
    const user = userEvent.setup()
    renderWithClient(<ProductFormDialog open onOpenChange={() => {}} product={null} />)

    await user.type(screen.getByLabelText('Name'), 'Another Product')
    await user.type(screen.getByLabelText('SKU'), 'dup-1')
    const price = screen.getByLabelText('Price')
    await user.clear(price)
    await user.type(price, '5')
    const stock = screen.getByLabelText('Stock')
    await user.clear(stock)
    await user.type(stock, '1')

    await user.click(screen.getByRole('button', { name: /create product/i }))
    expect(await screen.findByText(/has already been taken/i)).toBeInTheDocument()
    expect(screen.getByLabelText('SKU')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('ProductFormDialog — edit', () => {
  it('prefills the form and shows a Save action', async () => {
    const product: Product = {
      id: 1,
      name: 'Editable',
      description: 'A description',
      price: '12.50',
      stock: 3,
      sku: 'EDIT-1',
      active: false,
      created_at: '2026-07-06T00:00:00.000Z',
      updated_at: '2026-07-06T00:00:00.000Z',
    }
    renderWithClient(<ProductFormDialog open onOpenChange={() => {}} product={product} />)

    expect(await screen.findByDisplayValue('Editable')).toBeInTheDocument()
    expect(screen.getByDisplayValue('EDIT-1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
