import { createClient } from '@/lib/supabase/server'
import { addDays, monthYear, shortDate } from '@/lib/dates'
import { cop, todayBogota } from '@/lib/format'
import { ColumnChart, HBars, LineChart } from '@/components/charts'
import type { MonthlySummary } from '@/lib/types'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const today = todayBogota()
  const month = /^\d{4}-\d{2}$/.test(mes ?? '') ? (mes as string) : today.slice(0, 7)
  const monthStart = `${month}-01`

  const supabase = await createClient()
  const [summaryRes, catsRes, dailyRes] = await Promise.all([
    supabase.from('monthly_summary').select('*').order('month', { ascending: false }).limit(7),
    supabase.from('expenses_by_category').select('*').eq('month', monthStart).order('total', { ascending: false }),
    supabase.from('daily_totals').select('*').order('occurred_on'),
  ])

  const summary = (summaryRes.data ?? []) as MonthlySummary[]
  const current = summary.find((m) => m.month === monthStart)
  const income = Number(current?.income ?? 0)
  const expenses = Number(current?.expenses ?? 0)
  const debtPayments = Number(current?.debt_payments ?? 0)
  const yieldAmount = Number(current?.yield ?? 0)
  const saved = income + yieldAmount - expenses - debtPayments

  const categories = ((catsRes.data ?? []) as { category: string; total: number }[]).map((c) => ({
    label: c.category,
    value: Number(c.total),
  }))

  const chartMonths = [...summary]
    .reverse()
    .slice(-6)
    .map((m) => ({
      label: new Date(m.month + 'T00:00:00Z').toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' }),
      a: Number(m.income),
      b: Number(m.expenses),
    }))

  let cumulative = 0
  const points: { label: string; value: number }[] = []
  const since = addDays(today, -90)
  for (const row of (dailyRes.data ?? []) as { occurred_on: string; net: number }[]) {
    cumulative += Number(row.net)
    if (row.occurred_on >= since) points.push({ label: shortDate(row.occurred_on), value: cumulative })
  }

  return (
    <main className="space-y-5">
      <header className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] p-5 text-white shadow-[0_24px_44px_rgba(37,99,235,0.28)]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/80">Reportes</p>
        <h1 className="mt-2 text-3xl font-bold">{monthYear(monthStart)}</h1>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Card label="Ahorro neto" value={cop(saved)} tone="text-emerald-600" />
        <Card label="Gastos" value={cop(expenses)} tone="text-rose-600" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Gastos por categoría</h2>
        <div className="mt-4">
          {categories.length > 0 ? <HBars items={categories} color="bg-rose-500" /> : <p className="text-sm text-slate-500">No hay gastos registrados en este mes.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Ingresos vs gastos</h2>
        <div className="mt-4">
          {chartMonths.length > 0 ? <ColumnChart data={chartMonths} /> : <p className="text-sm text-slate-500">Aún no hay meses para comparar.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Evolución de tu plata (90 días)</h2>
        <div className="mt-4">
          {points.length > 0 ? <LineChart points={points} /> : <p className="text-sm text-slate-500">Sin movimientos recientes.</p>}
        </div>
      </section>
    </main>
  )
}

function Card({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white/90 p-3 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  )
}
