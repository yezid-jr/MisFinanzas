import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadUpcoming } from '@/lib/data'
import { cop, pct, todayBogota } from '@/lib/format'
import { monthlyRate } from '@/lib/finance'
import UpcomingList from '@/components/upcoming-list'
import type { MonthlySummary, PocketBalance } from '@/lib/types'
import { ArrowRightLeft, Target, TrendingUp, Wallet } from 'lucide-react'

const LINKS = [
  { href: '/transferir', label: 'Mover plata', icon: ArrowRightLeft },
  { href: '/cobros', label: 'Cobros', icon: TrendingUp },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/historial', label: 'Historial', icon: Wallet },
  { href: '/conciliar', label: 'Conciliar', icon: Wallet },
]

export default async function HomePage() {
  const supabase = await createClient()
  const firstOfMonth = todayBogota().slice(0, 7) + '-01'

  const [pocketsRes, monthRes, debtsRes, settingsRes, upcoming] = await Promise.all([
    supabase.from('pocket_balances').select('*').order('priority'),
    supabase.from('monthly_summary').select('*').eq('month', firstOfMonth).maybeSingle(),
    supabase.from('debt_balances').select('balance'),
    supabase.from('settings').select('nu_rate_ea').maybeSingle(),
    loadUpcoming(),
  ])

  const pockets = (pocketsRes.data ?? []) as PocketBalance[]
  const month = monthRes.data as MonthlySummary | null
  const total = pockets.reduce((sum, p) => sum + Number(p.balance), 0)
  const totalDebt = (debtsRes.data ?? []).reduce((s, d) => s + Number(d.balance), 0)
  const yieldEa = Number(settingsRes.data?.nu_rate_ea ?? 9.35)
  const yieldBase = pockets.filter((p) => p.earns_yield).reduce((s, p) => s + Number(p.balance), 0)
  const estimatedMonthlyYield = yieldBase * monthlyRate(yieldEa)
  const soon = upcoming.items.filter((i) => i.days <= 30).slice(0, 3)

  return (
    <main className="space-y-5">
      <header className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_35%,#2563eb_100%)] p-5 text-white shadow-[0_24px_44px_rgba(37,99,235,0.28)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-100/80">Total en tus cajas</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{cop(total)}</h1>
          </div>
          <form action="/auth/signout" method="post">
            <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/15">
              Salir
            </button>
          </form>
        </div>

        <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.18em] text-blue-100/80">Resumen</p>
          <p className="mt-1 text-sm font-medium text-white/90">
            Con {pct(yieldEa, 2)} E.A. tus cajas rinden ≈ {cop(estimatedMonthlyYield)} al mes
          </p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Ingresos" value={month?.income} tone="text-emerald-600" className="bg-emerald-50" />
        <Stat label="Gastos" value={month?.expenses} tone="text-rose-600" className="bg-rose-50" />
        <Stat label="Rendimiento" value={month?.yield} tone="text-sky-600" className="bg-sky-50" />
      </section>

      <section className="space-y-3 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_16px_28px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Accesos rápidos</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LINKS.map((l) => {
            const Icon = l.icon
            return (
              <Link key={l.href} href={l.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <Icon className="h-4 w-4" strokeWidth={2.1} />
                  </span>
                  {l.label}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_16px_28px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Próximos cobros</h2>
          <Link href="/cobros" className="text-xs font-medium text-indigo-600">Ver todos</Link>
        </div>
        <div className="mt-3 space-y-2">
          {soon.length === 0 ? (
            <p className="text-sm text-slate-500">Sin cobros próximos.</p>
          ) : (
            <UpcomingList items={soon} compact />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_16px_28px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Deuda total</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{cop(totalDebt)}</p>
          </div>
          <Link href="/deudas" className="text-sm font-medium text-indigo-600">Ver detalle →</Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mis cajas</h2>
          <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            {pockets.length}
          </span>
        </div>

        {pockets.length === 0 && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Aún no hay cajas. Corre el seed.sql en Supabase.
          </p>
        )}

        {pockets.map((p) => (
          <div key={p.pocket_id} className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-800">{p.emoji ?? '💰'} {p.name}</p>
                <p className="mt-1 text-xs text-slate-400">{p.account_name}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{cop(p.balance)}</p>
            </div>

            {p.goal && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Meta</span>
                  <span>{p.goal_pct ?? 0}% de {cop(p.goal)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#10b981_100%)]"
                    style={{ width: `${Math.min(100, Math.max(0, Number(p.goal_pct ?? 0)))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  )
}

function Stat({
  label,
  value,
  tone,
  className,
}: {
  label: string
  value?: number
  tone: string
  className?: string
}) {
  return (
    <div className={`rounded-[22px] border border-slate-200/80 p-3 shadow-[0_12px_24px_rgba(15,23,42,0.04)] ${className ?? ''}`}>
      <p className={`text-lg font-bold ${tone}`}>{cop(value)}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  )
}