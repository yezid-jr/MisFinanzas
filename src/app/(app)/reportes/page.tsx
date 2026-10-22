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
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Reportes</p>
        <h1 className="mt-2 text-3xl font-bold">{monthYear(monthStart)}</h1>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Card label="Ahorro neto" value={cop(saved)} tone="text-[#22C55E]" />
        <Card label="Gastos" value={cop(expenses)} tone="text-[#EF4444]" />
      </section>

      <section className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Gastos por categoría</h2>
        <div className="mt-4">
          {categories.length > 0 ? <HBars items={categories} color="bg-rose-500" /> : <p className="text-sm text-[#8a8a93]">No hay gastos registrados en este mes.</p>}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Ingresos vs gastos</h2>
        <div className="mt-4">
          {chartMonths.length > 0 ? <ColumnChart data={chartMonths} /> : <p className="text-sm text-[#8a8a93]">Aún no hay meses para comparar.</p>}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Evolución de tu plata (90 días)</h2>
        <div className="mt-4">
          {points.length > 0 ? <LineChart points={points} /> : <p className="text-sm text-[#8a8a93]">Sin movimientos recientes.</p>}
        </div>
      </section>
    </main>
  )
}

function Card({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[18px] border border-[#282830] bg-[#161619] p-3 shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a8a93]">{label}</p>
    </div>
  )
}
