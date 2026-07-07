import { http, HttpResponse } from 'msw'
import type { Product } from '@/types/product'

const BASE = 'http://localhost:3000/api/v1'

// A small in-memory store so create/update/delete/list behave like the real API.
let db: Product[] = []
let nextId = 1

/** Records mutating requests so tests can assert the exact payload sent. */
export const requestLog: Array<{ method: string; id: string | null; body: unknown }> = []

export function seedProducts(overrides: Partial<Product>[] = []): Product[] {
  db = overrides.map((item, index) => ({
    id: index + 1,
    name: `Product ${index + 1}`,
    description: null,
    price: '10.00',
    stock: 5,
    sku: `SKU-${String(index + 1).padStart(4, '0')}`,
    active: true,
    created_at: '2026-07-06T00:00:00.000Z',
    updated_at: '2026-07-06T00:00:00.000Z',
    ...item,
  }))
  nextId = db.length + 1
  return db
}

export function resetDb() {
  db = []
  nextId = 1
  requestLog.length = 0
}

const notFound = () =>
  HttpResponse.json(
    { error: { status: 404, code: 'not_found', message: 'Resource not found', details: {} } },
    { status: 404 },
  )

export const handlers = [
  http.get(`${BASE}/products`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('per_page') ?? '10')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const active = url.searchParams.get('active')

    let items = [...db]
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search))
    if (active === 'true') items = items.filter((p) => p.active)
    if (active === 'false') items = items.filter((p) => !p.active)

    const total = items.length
    const pages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage

    return HttpResponse.json({
      data: items.slice(start, start + perPage),
      meta: {
        total,
        page,
        pages,
        per_page: perPage,
        next: page < pages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    })
  }),

  http.get(`${BASE}/products/:id`, ({ params }) => {
    const product = db.find((p) => p.id === Number(params.id))
    return product ? HttpResponse.json({ data: product }) : notFound()
  }),

  http.post(`${BASE}/products`, async ({ request }) => {
    const body = (await request.json()) as { product: Record<string, unknown> }
    requestLog.push({ method: 'POST', id: null, body })
    const p = body.product
    const sku = String(p.sku ?? '').toUpperCase()
    if (db.some((x) => x.sku.toLowerCase() === sku.toLowerCase())) {
      return HttpResponse.json(
        {
          error: {
            status: 422,
            code: 'validation_error',
            message: 'Validation failed',
            details: { sku: ['has already been taken'] },
          },
        },
        { status: 422 },
      )
    }
    const created: Product = {
      id: nextId++,
      name: String(p.name),
      description: (p.description as string | undefined) ?? null,
      price: String(p.price),
      stock: Number(p.stock),
      sku,
      active: Boolean(p.active),
      created_at: '2026-07-06T00:00:00.000Z',
      updated_at: '2026-07-06T00:00:00.000Z',
    }
    db.unshift(created)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.put(`${BASE}/products/:id`, async ({ params, request }) => {
    const index = db.findIndex((p) => p.id === Number(params.id))
    if (index === -1) return notFound()
    const current = db[index]!
    const body = (await request.json()) as { product: Record<string, unknown> }
    requestLog.push({ method: 'PUT', id: String(params.id), body })
    const p = body.product
    const updated: Product = {
      ...current,
      ...(p.name !== undefined ? { name: String(p.name) } : {}),
      ...(p.sku !== undefined ? { sku: String(p.sku).toUpperCase() } : {}),
      ...(p.price !== undefined ? { price: String(p.price) } : {}),
      ...(p.stock !== undefined ? { stock: Number(p.stock) } : {}),
      ...(p.active !== undefined ? { active: Boolean(p.active) } : {}),
      ...(p.description !== undefined ? { description: (p.description as string | undefined) ?? null } : {}),
    }
    db[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  http.delete(`${BASE}/products/:id`, ({ params }) => {
    const index = db.findIndex((p) => p.id === Number(params.id))
    if (index === -1) return notFound()
    requestLog.push({ method: 'DELETE', id: String(params.id), body: null })
    db.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
