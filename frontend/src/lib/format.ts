const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Format the API's string price for display without float math. */
export function formatPrice(price: string): string {
  const value = Number(price)
  return Number.isFinite(value) ? currencyFormatter.format(value) : price
}

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
})

/** Compact currency for large aggregates: $5.48M, $982K. */
export function formatCompactCurrency(value: string | number): string {
  const n = Number(value)
  return Number.isFinite(n) ? compactCurrencyFormatter.format(n) : String(value)
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date)
}
