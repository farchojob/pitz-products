const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Format the API's string price for display without float math. */
export function formatPrice(price: string): string {
  const value = Number(price)
  return Number.isFinite(value) ? currencyFormatter.format(value) : price
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date)
}
