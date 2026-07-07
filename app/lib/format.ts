/**
 * Format an integer amount of minor currency units (e.g. cents) as money.
 */
export function formatMoney(minor: number | null | undefined, currency = "USD"): string {
  const value = (minor ?? 0) / 100

  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value)
  }
  catch {
    return `${value.toFixed(2)} ${currency}`
  }
}
