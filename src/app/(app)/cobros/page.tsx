import { createClient } from '@/lib/supabase/server'
import { loadUpcoming } from '@/lib/data'
import { cop } from '@/lib/format'
import { fundingByPocket } from '@/lib/upcoming'
import UpcomingList from '@/components/upcoming-list'
import { DeleteRecurringButton, RecurringForm } from '@/components/cobros-actions'
import type { Category, PocketLite, RecurringCharge } from '@/lib/types'

export default async function CobrosPage() {
  const supabase = await createClient()
  const [upcoming, recRes, pocketsRes, catsRes] = await Promise.all([
    loadUpcoming(),
    supabase.from('recurring_charges').select('*').eq('is_active', true).order('day_of_month'),
    supabase.from('pocket_balances').select('pocket_id,name,emoji,balance').order('priority'),
    supabase.from('categories').select('id,name,emoji,default_pocket_id').order('name'),
  ])

  const recurring = (recRes.data ?? []) as RecurringCharge[]
  const pockets = (pocketsRes.data ?? []) as PocketLite[]
  const categories = (catsRes.data ?? []) as Category[]
  const warnings = fundingByPocket(upcoming.items, 30)
  const monthlyFixed = recurring.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <main className="space-y-5">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Cobros</p>
        <h1 className="mt-2 text-3xl font-bold">{cop(monthlyFixed)}</h1>
        <p className="mt-1 text-sm text-[#8a8a93]">Cobros fijos al mes</p>
      </header>

      {warnings.length > 0 && (
        <section className="rounded-[24px] border border-[#d97724]/20 bg-[#d97724]/10 p-4 text-sm text-[#f7c07a]">
          {warnings.map((w) => (
            <p key={w.name} className="mb-1 last:mb-0">
              ⚠️ En los próximos 30 días {w.name} necesita {cop(w.needed)} y tiene {cop(w.balance)}. Faltan {cop(w.short)}.
            </p>
          ))}
        </section>
      )}

      <section className="space-y-3 rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Lo que viene</h2>
        <UpcomingList items={upcoming.items.filter((i) => i.days <= 30)} />
      </section>

      <section className="space-y-3 rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Mis cobros fijos</h2>
        {recurring.length === 0 ? (
          <p className="rounded-2xl border border-[#282830] bg-[#0d0d0e] p-3 text-sm text-[#8a8a93]">Aún no tienes cobros fijos.</p>
        ) : (
          <div className="space-y-2">
            {recurring.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-[#282830] bg-[#0d0d0e] p-3">
                <div>
                  <p className="font-medium text-white">{r.name}</p>
                  <p className="text-xs text-[#8a8a93]">Cada día {r.day_of_month}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{cop(r.amount)}</p>
                  <DeleteRecurringButton id={r.id} name={r.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <RecurringForm pockets={pockets} categories={categories} />
      </div>
    </main>
  )
}
