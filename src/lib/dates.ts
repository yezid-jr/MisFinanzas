// Fechas como texto YYYY-MM-DD, calculadas en UTC para evitar errores de zona horaria.

export const toISO = (d: Date) => d.toISOString().slice(0, 10)
export const parseISO = (s: string) => new Date(s + 'T00:00:00Z')

export function addDays(iso: string, n: number) {
  const d = parseISO(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toISO(d)
}

/** Días desde a hasta b (b - a) */
export const daysBetween = (a: string, b: string) =>
  Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86_400_000)

const lastDayOfMonth = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate()

const makeISO = (y: number, m0: number, day: number) => {
  const d = Math.min(day, lastDayOfMonth(y, m0))
  return `${y}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Primera fecha con ese día del mes ESTRICTAMENTE posterior a `after` */
export function nextOccurrence(day: number, after: string) {
  const [y, m] = after.split('-').map(Number)
  for (let i = 0; i < 3; i++) {
    const idx = m - 1 + i
    const iso = makeISO(y + Math.floor(idx / 12), idx % 12, day)
    if (iso > after) return iso
  }
  return after
}

/** Última fecha con ese día del mes que sea igual o anterior a `onOrBefore` */
export function prevOccurrence(day: number, onOrBefore: string) {
  const [y, m] = onOrBefore.split('-').map(Number)
  for (let i = 0; i < 3; i++) {
    const idx = m - 1 - i
    const iso = makeISO(y + Math.floor(idx / 12), ((idx % 12) + 12) % 12, day)
    if (iso <= onOrBefore) return iso
  }
  return onOrBefore
}

/** Suma meses conservando el día (ej. 19 nov -> 19 dic; 31 ene -> 28 feb) */
export function addMonthsKeepDay(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const idx = m - 1 + n
  return makeISO(y + Math.floor(idx / 12), ((idx % 12) + 12) % 12, d)
}

export function relativeLabel(days: number) {
  if (days < 0) return `Atrasado ${-days} d`
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `En ${days} días`
}

export const shortDate = (iso: string) =>
  parseISO(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export const monthYear = (iso: string) =>
  parseISO(iso).toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  const idx = m - 1 + delta
  return `${y + Math.floor(idx / 12)}-${String(((idx % 12) + 12) % 12 + 1).padStart(2, '0')}`
}