const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const cop2Formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const cop = (n: number | null | undefined) => copFormatter.format(n ?? 0)
export const cop2 = (n: number | null | undefined) => cop2Formatter.format(n ?? 0)

export const pct = (n: number, decimals = 1) => `${n.toFixed(decimals).replace('.', ',')}%`

/** Fecha de hoy en Colombia, formato YYYY-MM-DD */
export const todayBogota = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

/** "12.500" o "$ 12500" -> 12500 (solo enteros) */
export const parsePesos = (value: string) => Number(value.replace(/\D/g, '')) || 0

/**
 * Acepta formato colombiano: "34.846.655,95" -> 34846655.95
 * También entiende "1234.5" y "250000".
 */
export function parseMoney(value: string): number {
  let v = (value ?? '').replace(/[^\d.,]/g, '')
  if (!v) return 0
  if (v.includes(',')) {
    v = v.replace(/\./g, '').replace(',', '.')
  } else if (!/^\d+\.\d{1,2}$/.test(v)) {
    v = v.replace(/\./g, '')
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}