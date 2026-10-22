import { createClient } from '@/lib/supabase/server'
import { todayBogota } from '@/lib/format'
import { buildUpcoming } from '@/lib/upcoming'
import type { Debt, DebtBalance, Installment, PocketLite, RecurringCharge } from '@/lib/types'

export async function loadUpcoming() {
  const supabase = await createClient()
  const today = todayBogota()

  const [rc, inst, debts, bal, pockets, settings] = await Promise.all([
    supabase.from('recurring_charges').select('*').eq('is_active', true),
    supabase.from('debt_installments').select('*').is('paid_at', null).order('due_on'),
    supabase.from('debts').select('*').eq('is_active', true),
    supabase.from('debt_balances').select('debt_id,balance'),
    supabase.from('pocket_balances').select('pocket_id,name,emoji,balance'),
    supabase.from('settings').select('start_date').maybeSingle(),
  ])

  const items = buildUpcoming({
    today,
    startDate: (settings.data?.start_date as string | undefined) ?? today,
    recurring: (rc.data ?? []) as RecurringCharge[],
    installments: (inst.data ?? []) as Installment[],
    debts: (debts.data ?? []) as Debt[],
    balances: (bal.data ?? []) as DebtBalance[],
    pockets: (pockets.data ?? []) as PocketLite[],
  })

  return { items, today }
}
