import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { ProductsPage } from './products-page'
import { renderWithClient } from '@/test/utils'
import { seedProducts } from '@/test/handlers'
import { server } from '@/test/server'

const BASE = 'http://localhost:3000/api/v1'

describe('ProductsPage', () => {
  it('renders products from the API', async () => {
    seedProducts([{ name: 'Alpha Widget' }, { name: 'Beta Gadget' }])
    renderWithClient(<ProductsPage />)

    const table = await screen.findByRole('table')
    expect(within(table).getByText('Alpha Widget')).toBeInTheDocument()
    expect(within(table).getByText('Beta Gadget')).toBeInTheDocument()
  })

  it('shows a loading state before the list appears', async () => {
    seedProducts([{ name: 'Alpha Widget' }])
    renderWithClient(<ProductsPage />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('shows the empty state when there are no products', async () => {
    seedProducts([])
    renderWithClient(<ProductsPage />)

    expect(await screen.findByText(/no products yet/i)).toBeInTheDocument()
  })

  it('shows an error state with a retry action when the request fails', async () => {
    server.use(http.get(`${BASE}/products`, () => HttpResponse.error()))
    renderWithClient(<ProductsPage />)

    expect(await screen.findByText(/could not load products/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

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
      const table = screen.getByRole('table')
      expect(within(table).getByText('Inactive One')).toBeInTheDocument()
      expect(within(table).queryByText('Active One')).not.toBeInTheDocument()
    })
  })

  it('searches by name (debounced) and resets to page 1', async () => {
    seedProducts([{ name: 'Alpha Widget' }, { name: 'Beta Gadget' }])
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    await user.type(screen.getByRole('textbox', { name: /search products by name/i }), 'beta')

    await waitFor(
      () => {
        const table = screen.getByRole('table')
        expect(within(table).getByText('Beta Gadget')).toBeInTheDocument()
        expect(within(table).queryByText('Alpha Widget')).not.toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  it('paginates to the next page', async () => {
    seedProducts(Array.from({ length: 15 }, (_, index) => ({ name: `Item ${index + 1}` })))
    const user = userEvent.setup()
    renderWithClient(<ProductsPage />)
    await screen.findByRole('table')

    expect(screen.getByText('1–10 of 15')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByText('11–15 of 15')).toBeInTheDocument())
  })
})
