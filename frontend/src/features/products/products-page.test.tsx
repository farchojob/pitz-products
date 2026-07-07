import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { ProductsPage } from './products-page'
import { renderWithClient } from '@/test/utils'
import { requestLog, seedProducts } from '@/test/handlers'
import { server } from '@/test/server'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const BASE = 'http://localhost:3000/api/v1'
const table = () => screen.getByRole('table')

describe('ProductsPage — list & states', () => {
  it('renders products from the API', async () => {
    seedProducts([{ name: 'Alpha Widget' }, { name: 'Beta Gadget' }])
    renderWithClient(<ProductsPage />)

    const t = await screen.findByRole('table')
    expect(within(t).getByText('Alpha Widget')).toBeInTheDocument()
    expect(within(t).getByText('Beta Gadget')).toBeInTheDocument()
  })

  it('shows a loading skeleton before the list appears', async () => {
    seedProducts([{ name: 'Alpha Widget' }])
    renderWithClient(<ProductsPage />)

    expect(screen.getByRole('status', { name: /loading products/i })).toBeInTheDocument()
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('shows the empty state when there are no products', async () => {
    seedProducts([])
    renderWithClient(<ProductsPage />)

    expect(await screen.findByText(/no products yet/i)).toBeInTheDocument()
  })

  it('shows an error state (network) with a retry action', async () => {
    server.use(http.get(`${BASE}/products`, () => HttpResponse.error()))
    renderWithClient(<ProductsPage />)

    expect(await screen.findByText(/could not load products/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('shows the backend error message in the error state', async () => {
    server.use(
      http.get(`${BASE}/products`, () =>
        HttpResponse.json(
          { error: { status: 500, code: 'internal_server_error', message: 'Something went wrong', details: {} } },
          { status: 500 },
        ),
      ),
    )
    renderWithClient(<ProductsPage />)
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })

  it('formats price as currency and renders status badges', async () => {
    seedProducts([
      { name: 'Pricey', price: '1234.5', active: true },
      { name: 'Cheap', price: '9.9', active: false },
    ])
    renderWithClient(<ProductsPage />)
    const t = await screen.findByRole('table')

    expect(within(t).getByText('$1,234.50')).toBeInTheDocument()
    expect(within(t).getByText('$9.90')).toBeInTheDocument()

    const priceyRow = within(t).getByText('Pricey').closest('tr')!
    expect(within(priceyRow).getByText('Active')).toBeInTheDocument()
    const cheapRow = within(t).getByText('Cheap').closest('tr')!
    expect(within(cheapRow).getByText('Inactive')).toBeInTheDocument()
  })

  it('renders the mobile card list alongside the table (dual view)', async () => {
    seedProducts([{ name: 'Alpha Widget' }])
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    // one action button in the table, one in the card list
    expect(screen.getAllByLabelText('Edit Alpha Widget')).toHaveLength(2)
  })
})

describe('ProductsPage — search, filter & pagination', () => {
  it('filters by status', async () => {
    seedProducts([
      { name: 'Active One', active: true },
      { name: 'Inactive One', active: false },
    ])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.click(screen.getByRole('combobox', { name: /filter by status/i }))
    await user.click(await screen.findByRole('option', { name: 'Inactive' }))

    await waitFor(() => {
      expect(within(table()).getByText('Inactive One')).toBeInTheDocument()
      expect(within(table()).queryByText('Active One')).not.toBeInTheDocument()
    })
  })

  it('searches by name (debounced)', async () => {
    seedProducts([{ name: 'Alpha Widget' }, { name: 'Beta Gadget' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.type(screen.getByRole('textbox', { name: /search products by name/i }), 'beta')

    await waitFor(
      () => {
        expect(within(table()).getByText('Beta Gadget')).toBeInTheDocument()
        expect(within(table()).queryByText('Alpha Widget')).not.toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  it('paginates to the next page', async () => {
    seedProducts(Array.from({ length: 15 }, (_, i) => ({ name: `Item ${String(i + 1).padStart(2, '0')}` })))
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    expect(screen.getByText('1–10 of 15')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByText('11–15 of 15')).toBeInTheDocument())
  })

  it('resets to page 1 when the search changes', async () => {
    seedProducts(Array.from({ length: 15 }, (_, i) => ({ name: `Item ${String(i + 1).padStart(2, '0')}` })))
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByText('11–15 of 15')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox', { name: /search products by name/i }), 'Item')
    await waitFor(() => expect(screen.getByText('1–10 of 15')).toBeInTheDocument(), { timeout: 2000 })
  })

  it('clears filters from the empty-filtered state', async () => {
    seedProducts([{ name: 'Alpha Widget' }, { name: 'Beta Gadget' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.type(screen.getByRole('textbox', { name: /search products by name/i }), 'zzz')
    expect(await screen.findByText(/no products match your filters/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    await waitFor(() => {
      expect(within(table()).getByText('Alpha Widget')).toBeInTheDocument()
      expect(within(table()).getByText('Beta Gadget')).toBeInTheDocument()
    })
    expect(screen.getByRole('textbox', { name: /search products by name/i })).toHaveValue('')
  })
})

describe('ProductsPage — CRUD end-to-end', () => {
  it('creates a product: dialog → API → new row, with a normalized SKU and string price', async () => {
    seedProducts([{ name: 'Existing Item' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.click(screen.getByRole('button', { name: /new product/i }))
    const dialog = await screen.findByRole('dialog', { name: /new product/i })
    await user.type(within(dialog).getByLabelText('Name'), 'Fresh Widget')
    await user.type(within(dialog).getByLabelText('SKU'), 'fresh-1')
    const price = within(dialog).getByLabelText('Price')
    await user.clear(price)
    await user.type(price, '29.99')
    const stock = within(dialog).getByLabelText('Stock')
    await user.clear(stock)
    await user.type(stock, '3')
    await user.click(within(dialog).getByRole('button', { name: /create product/i }))

    await waitFor(() => expect(within(table()).getByText('Fresh Widget')).toBeInTheDocument())
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /new product/i })).not.toBeInTheDocument())

    const post = requestLog.find((r) => r.method === 'POST')
    expect(post?.body).toMatchObject({
      product: { name: 'Fresh Widget', sku: 'FRESH-1', price: '29.99', stock: 3, active: true },
    })
    expect(toast.success).toHaveBeenCalledWith('Created "Fresh Widget"')
  })

  it('edits a product: change name → updated row, PUT hits the right id', async () => {
    seedProducts([{ name: 'Old Name', sku: 'EDIT-1' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.click(within(table()).getByRole('button', { name: 'Edit Old Name' }))
    const dialog = await screen.findByRole('dialog', { name: /edit product/i })
    const name = within(dialog).getByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'New Name')
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(within(table()).getByText('New Name')).toBeInTheDocument())
    expect(within(table()).queryByText('Old Name')).not.toBeInTheDocument()

    const put = requestLog.find((r) => r.method === 'PUT')
    expect(put?.id).toBe('1')
    expect(put?.body).toMatchObject({ product: { name: 'New Name' } })
    expect(toast.success).toHaveBeenCalledWith('Updated "New Name"')
  })

  it('deletes a product: confirm → row removed, others remain', async () => {
    seedProducts([{ name: 'Alpha Widget' }, { name: 'Beta Gadget' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.click(within(table()).getByRole('button', { name: 'Delete Alpha Widget' }))
    const alert = await screen.findByRole('alertdialog')
    await user.click(within(alert).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(within(table()).queryByText('Alpha Widget')).not.toBeInTheDocument())
    expect(within(table()).getByText('Beta Gadget')).toBeInTheDocument()

    expect(requestLog.find((r) => r.method === 'DELETE')?.id).toBe('1')
    expect(toast.success).toHaveBeenCalledWith('Deleted "Alpha Widget"')
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows an error toast and keeps the row when delete fails', async () => {
    seedProducts([{ name: 'Alpha Widget' }])
    server.use(http.delete(`${BASE}/products/:id`, () => HttpResponse.error()))
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.click(within(table()).getByRole('button', { name: 'Delete Alpha Widget' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    // Optimistic delete: the dialog closed and the row was removed, but the failure
    // rolls the row back into the list.
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    await waitFor(() => expect(within(table()).getByText('Alpha Widget')).toBeInTheDocument())
  })

  it('resets the form to empty when reopening for create after an edit', async () => {
    seedProducts([{ name: 'Old Name', sku: 'EDIT-1' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    // open edit (prefilled), then cancel
    await user.click(within(table()).getByRole('button', { name: 'Edit Old Name' }))
    let dialog = await screen.findByRole('dialog', { name: /edit product/i })
    expect(within(dialog).getByLabelText('Name')).toHaveValue('Old Name')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    // open create — fields must be empty, not the previous product's values
    await user.click(screen.getByRole('button', { name: /new product/i }))
    dialog = await screen.findByRole('dialog', { name: /new product/i })
    expect(within(dialog).getByLabelText('Name')).toHaveValue('')
    expect(within(dialog).getByLabelText('SKU')).toHaveValue('')
  })
})

describe('ProductsPage — URL state', () => {
  it('reflects the search term in the URL', async () => {
    seedProducts([{ name: 'Alpha Widget' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.type(screen.getByRole('textbox', { name: /search products by name/i }), 'alpha')
    await waitFor(() => expect(window.location.search).toContain('search=alpha'))
  })

  it('initializes the filter from the URL on mount', async () => {
    seedProducts([
      { name: 'Active One', active: true },
      { name: 'Inactive One', active: false },
    ])
    window.history.replaceState(null, '', '/?active=false')
    renderWithClient(<ProductsPage />)

    const t = await screen.findByRole('table')
    expect(within(t).getByText('Inactive One')).toBeInTheDocument()
    expect(within(t).queryByText('Active One')).not.toBeInTheDocument()
  })
})
