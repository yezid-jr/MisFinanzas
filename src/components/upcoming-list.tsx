import Link from 'next/link'
import { cop } from '@/lib/format'
import { relativeLabel, shortDate } from '@/lib/dates'
import type { UpcomingItem } from '@/lib/upcoming'
import { AlertTriangle } from 'lucide-react'

export default function UpcomingList({ items, compact = false }: { items: UpcomingItem[]; compact?: boolean }) {
  if (!items.length) return <p className="text-sm text-slate-500">Sin pendientes.</p>

  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-800">{it.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{shortDate(it.due)}</span>
                <span>•</span>
                <span>{relativeLabel(it.days)}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-800">{cop(it.amount)}</p>
          </div>

          {it.short > 0 && (
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5" strokeWidth={2.2} />
              <span>
                {it.pocketName} tiene {cop(it.pocketBalance)} y faltan {cop(it.short)}.
              </span>
            </div>
          )}

          {!compact && (
            <div className="mt-3 flex justify-end">
              {it.kind === 'recurring' ? (
                <Link href="/cobros" className="text-xs font-medium text-indigo-600">Ir a pagar →</Link>
              ) : (
                <Link href="/deudas" className="text-xs font-medium text-indigo-600">Ir a pagar →</Link>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
