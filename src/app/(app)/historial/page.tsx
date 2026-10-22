import { createClient } from '@/lib/supabase/server'
import { shortDate } from '@/lib/dates'
import { cop2 } from '@/lib/format'
import DeleteGroupButton from './delete-button'

type Row = {
  id: string
  group_id: string
  occurred_on: string
  kind: string
  amount: number
  note: string | null
  income_source: string | null
  pocket: { name: string; emoji: string | null } | null
  category: { name: string; emoji: string | null } | null
}

const FILTERS = [
  { key: 'todo', label: 'Todo', kinds: null },
  { key: 'ingresos', label: 'Ingresos', kinds: ['income'] },
  { key: 'gastos', label: 'Gastos', kinds: ['expense'] },
  { key: 'mover', label: 'Movimientos', kinds: ['transfer_in', 'transfer_out'] },
  { key: 'deudas', label: 'Deudas', kinds: ['debt_payment'] },
  { key: 'otros', label: 'Otros', kinds: ['yield', 'adjustment', 'opening'] },
] as const

const SOURCE: Record<string, string> = { work: 'Trabajo', tattoo: 'Tatuaje', other: 'Otro' }

function describe(rows: Row[]) {
  const first = rows[0]
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)
  switch (first.kind) {
    case 'income':
      return { icon: '💵', title: `Ingreso · ${SOURCE[first.income_source ?? 'other']}`, amount: total, tone: 'text-emerald-600' }
    case 'expense':
      return {
        icon: first.category?.emoji ?? '🧾',
        title: first.category?.name ?? 'Gasto',
        amount: total,
        tone: 'text-rose-600',
      }
    case 'transfer_in':
    case 'transfer_out': {
      const from = rows.find((r) => r.kind === 'transfer_out')?.pocket?.name
      const to = rows.find((r) => r.kind === 'transfer_in')?.pocket?.name
      return { icon: '🔁', title: `${from ?? '?'} → ${to ?? '?'}`, amount: Math.abs(Number(rows.find((r) => r.kind === 'transfer_in')?.amount ?? 0)), tone: 'text-slate-600' }
    }
    case 'debt_payment':
      return { icon: '💳', title: 'Pago de deuda', amount: total, tone: 'text-orange-600' }
    case 'yield':
      return { icon: '📈', title: 'Rendimiento', amount: total, tone: 'text-sky-600' }
    case 'opening':
      return { icon: '🏁', title: 'Saldo inicial', amount: total, tone: 'text-slate-600' }
    default:
      return { icon: '⚖️', title: 'Ajuste', amount: total, tone: 'text-slate-600' }
  }
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const { tipo } = await searchParams
  const filter = FILTERS.find((f) => f.key === tipo) ?? FILTERS[0]

  const supabase = await createClient()
  let query = supabase
    .from('movements')
    .select(
      'id,group_id,occurred_on,kind,amount,note,income_source,pocket:pockets(name,emoji),category:categories(name,emoji)'
    )
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)
  if (filter.kinds) query = query.in('kind', filter.kinds)

  const { data } = await query
  const rows = (data ?? []) as unknown as Row[]
  const groups = new Map<string, Row[]>()
  for (const r of rows) {
    const key = r.group_id || r.id
    groups.set(key, [...(groups.get(key) ?? []), r])
  }

  return (
    <main className="space-y-5">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Historial</p>
        <h1 className="mt-2 text-3xl font-bold">Movimientos</h1>
      </header>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f.key}
            href={`/historial?tipo=${f.key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter.key === f.key ? 'bg-[#d97724] text-white' : 'bg-[#0d0d0e] text-[#8a8a93] border border-[#282830]'
            }`}
          >
            {f.label}
          </a>
        ))}
      </nav>

      {groups.size === 0 ? (
        <p className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 text-sm text-[#8a8a93]">No hay movimientos todavía.</p>
      ) : (
        <div className="space-y-3">
          {[...groups.entries()].map(([groupId, g]) => {
            const d = describe(g)
            const detail =
              g[0].kind === 'income'
                ? g.map((r) => `${r.pocket?.emoji ?? ''} ${r.pocket?.name}: ${cop2(r.amount)}`).join(' · ')
                : g[0].pocket
                  ? `${g[0].pocket.emoji ?? ''} ${g[0].pocket.name}`
                  : ''

            return (
              <div key={groupId} className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-white">
                      <span>{d.icon}</span>
                      <span>{d.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#8a8a93]">{shortDate(g[0].occurred_on)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${d.tone}`}>{cop2(d.amount)}</p>
                    <DeleteGroupButton groupId={groupId} />
                  </div>
                </div>

                {detail && <p className="mt-2 text-xs text-[#8a8a93]">{detail}</p>}
                {g[0].note && <p className="mt-1 text-xs text-[#8a8a93]">“{g[0].note}”</p>}
              </div>
            )
          })}
        </div>
      )}

      {rows.length >= 200 && <p className="text-xs text-[#8a8a93]">Mostrando los últimos 200 registros.</p>}
    </main>
  )
}
