export const toISO = (d: Date) => d.toISOString().slice(0, 10)
export const parseISO = (s: string) => new Date(s + 'T00:00:00Z')

export function addDays(iso: string, n: number) {
  const d = parseISO(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toISO(d)
}

export const daysBetween = (a: string, b: string) =>
  Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86_400_000)

const lastDayOfMonth = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate()

const makeISO = (y: number, m0: number, day: number) => {
  const d = Math.min(day, lastDayOfMonth(y, m0))
  return `${y}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function nextOccurrence(day: number, after: string) {
  const [y, m] = after.split('-').map(Number)
  let yy = y
  let mm = m - 1
  for (let i = 0; i < 24; i += 1) {
    const iso = makeISO(yy, mm, day)
    if (iso > after) return iso
    mm += 1
    if (mm > 11) {
      mm = 0
      yy += 1
    }
  }
  return after
}

export function prevOccurrence(day: number, onOrBefore: string) {
  const [y, m] = onOrBefore.split('-').map(Number)
  let yy = y
  let mm = m - 1
  for (let i = 0; i < 24; i += 1) {
    const iso = makeISO(yy, mm, day)
    if (iso <= onOrBefore) return iso
    mm -= 1
    if (mm < 0) {
      mm = 11
      yy -= 1
    }
  }
  return onOrBefore
}

export const shortDate = (iso: string) =>
  parseISO(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

export const relativeLabel = (days: number) => {
  if (days < 0) return `Hace ${Math.abs(days)} días`
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `En ${days} días`
}

export const monthYear = (iso: string) =>
  parseISO(iso).toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  const idx = m - 1 + delta
  return `${y + Math.floor(idx / 12)}-${String(((idx % 12) + 12) % 12 + 1).padStart(2, '0')}`
}
