import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cop, todayBogota } from '@/lib/format'
import { monthlyRate } from '@/lib/finance'
import type { Debt, DebtBalance, DebtEntryLite, Installment, PocketLite } from '@/lib/types'
import DebtCard from './debt-card'

export default async function DebtsPage() {
  const supabase = await createClient()
  const [debtsRes, balRes, instRes, entriesRes, pocketsRes, settingsRes] = await Promise.all([
    supabase.from('debts').select('*').eq('is_active', true).order('name'),
    supabase.from('debt_balances').select('debt_id,balance'),
    supabase.from('debt_installments').select('*').order('due_on'),
    supabase.from('debt_entries').select('debt_id,kind,amount'),
    supabase.from('pocket_balances').select('pocket_id,name,emoji,balance').order('priority'),
    supabase.from('settings').select('nu_rate_ea').maybeSingle(),
  ])

  const balances = new Map(((balRes.data ?? []) as DebtBalance[]).map((b) => [b.debt_id, Number(b.balance)]))
  const installments = (instRes.data ?? []) as Installment[]
  const entries = (entriesRes.data ?? []) as DebtEntryLite[]
  const pockets = (pocketsRes.data ?? []) as PocketLite[]
  const yieldEa = Number(settingsRes.data?.nu_rate_ea ?? 9.35)

  const debts = ((debtsRes.data ?? []) as Debt[]).map((d) => ({ ...d, balance: balances.get(d.id) ?? 0 }))
  const total = debts.reduce((s, d) => s + d.balance, 0)
  const monthlyInterest = debts.reduce(
    (s, d) => s + (d.rate_ea ? d.balance * monthlyRate(Number(d.rate_ea)) : 0),
    0
  )

  return (
    <main className="space-y-4">
      <header
        className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.95),rgba(18,18,22,0.96))] p-5 text-white"
        style={{ boxShadow: '0 0 30px rgba(var(--brand-rgb), 0.12)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Resumen</p>
            <h1 className="mt-2 text-3xl font-bold">Deudas</h1>
          </div>
          <Link
            href="/deudas/nueva"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)' }}
          >
            + Nueva
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-[20px] border border-[#282830] bg-[#161619] p-3 shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
          <p className="text-lg font-semibold text-rose-400">{cop(total)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#8a8a93]">Deuda total</p>
        </div>
        <div className="rounded-[20px] border border-[#282830] bg-[#161619] p-3 shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
          <p className="text-lg font-semibold" style={{ color: 'var(--brand-strong)' }}>≈ {cop(monthlyInterest)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#8a8a93]">Interés al mes</p>
        </div>
      </section>

      {debts.length === 0 && (
        <div className="space-y-2 rounded-[24px] border border-[#282830] bg-[#161619] p-6 text-center shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
          <p className="text-3xl">🎉</p>
          <p className="text-sm text-[#8a8a93]">No tienes deudas registradas.</p>
          <Link href="/deudas/nueva" className="inline-block text-sm font-medium" style={{ color: 'var(--brand-strong)' }}>
            Agregar una deuda
          </Link>
        </div>
      )}

      {debts.map((d) => (
        <DebtCard
          key={d.id}
          debt={d}
          pockets={pockets}
          installments={installments.filter((i) => i.debt_id === d.id)}
          entries={entries.filter((e) => e.debt_id === d.id)}
          yieldEa={yieldEa}
          today={todayBogota()}
        />
      ))}
    </main>
  )
}