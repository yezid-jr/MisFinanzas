import { cop } from '@/lib/format'
import type { UpcomingItem } from '@/lib/upcoming'
import type { PushPayload } from '@/lib/push'

/**
 * Arma UNA notificación con lo que vence hoy, mañana o en 3 días (y lo atrasado).
 * Devuelve null si no hay nada que avisar.
 */
export function buildDigest(items: UpcomingItem[]): PushPayload | null {
  const due = items.filter((i) => i.days <= 0 || i.days === 1 || i.days === 3)
  if (due.length === 0) return null

  const when = (d: number) => (d < 0 ? 'Atrasado' : d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : 'En 3 días')
  const lines = due.map((i) => `${when(i.days)}: ${i.title} ${cop(i.amount)}`)
  for (const i of due) {
    if (i.short > 0) lines.push(`⚠️ ${i.pocketName}: faltan ${cop(i.short)} para ${i.title}`)
  }

  return {
    title: due.length === 1 ? `🔔 ${due[0].title}` : `🔔 ${due.length} cobros por atender`,
    body: lines.join('\n'),
    url: '/cobros',
    tag: 'alertas-cobros',
  }
}
