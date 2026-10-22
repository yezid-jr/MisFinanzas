import { cop } from '@/lib/format'

export function HBars({ items, color = 'bg-rose-500' }: { items: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>{item.label}</span>
            <span>{cop(item.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ColumnChart({ data }: { data: { label: string; a: number; b: number }[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.a, d.b]))

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 items-end justify-center gap-1.5">
            <div className="w-2.5 rounded-t-xl bg-emerald-500" style={{ height: `${(d.a / max) * 100}%` }} />
            <div className="w-2.5 rounded-t-xl bg-rose-500" style={{ height: `${(d.b / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-slate-500">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Ingresos</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> Gastos</span>
      </div>
    </div>
  )
}

export function LineChart({ points }: { points: { label: string; value: number }[] }) {
  const W = 260
  const H = 110
  const P = 12
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const x = (i: number) => P + (i / (points.length - 1)) * (W - 2 * P)
  const y = (v: number) => H - P - ((v - min) / span) * (H - 2 * P)
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - P} L${x(0).toFixed(1)},${H - P} Z`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full">
        <path d={area} fill="rgba(59,130,246,0.12)" />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>{points[0]?.label}</span>
        <span>{cop(points[points.length - 1]?.value ?? 0)}</span>
      </div>
    </div>
  )
}
