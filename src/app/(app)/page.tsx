import { createClient } from '@/lib/supabase/server'
import { loadUpcoming } from '@/lib/data'
import { cop, todayBogota } from '@/lib/format'
import { monthlyRate } from '@/lib/finance'
import type { MonthlySummary, PocketBalance } from '@/lib/types'
import { HomeDashboard } from '@/components/home-dashboard'

export default async function HomePage() {
  const supabase = await createClient()
  const firstOfMonth = todayBogota().slice(0, 7) + '-01'

  const [pocketsRes, monthRes, debtsRes, settingsRes, upcoming, userRes] = await Promise.all([
    supabase.from('pocket_balances').select('*').order('priority'),
    supabase.from('monthly_summary').select('*').eq('month', firstOfMonth).maybeSingle(),
    supabase.from('debt_balances').select('balance'),
    supabase.from('settings').select('nu_rate_ea').maybeSingle(),
    loadUpcoming(),
    supabase.auth.getUser(),
  ])

  const pockets = (pocketsRes.data ?? []) as PocketBalance[]
  const month = monthRes.data as MonthlySummary | null
  const total = pockets.reduce((sum, p) => sum + Number(p.balance), 0)
  const totalDebt = (debtsRes.data ?? []).reduce((s, d) => s + Number(d.balance), 0)
  const yieldEa = Number(settingsRes.data?.nu_rate_ea ?? 9.35)
  const yieldBase = pockets.filter((p) => p.earns_yield).reduce((s, p) => s + Number(p.balance), 0)
  const estimatedMonthlyYield = yieldBase * monthlyRate(yieldEa)
  const soon = upcoming.items.filter((i) => i.days <= 30).slice(0, 3)
  const user = userRes.data.user
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.first_name ||
    user?.email?.split('@')[0] ||
    'Usuario'

  return (
    <HomeDashboard
      total={total}
      income={month?.income ?? 0}
      expenses={month?.expenses ?? 0}
      yieldAmount={month?.yield ?? 0}
      estimatedMonthlyYield={estimatedMonthlyYield}
      yieldEa={yieldEa}
      userName={fullName}
    />
  )
}