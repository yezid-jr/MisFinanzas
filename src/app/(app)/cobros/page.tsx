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
      <header className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#312e81_100%)] p-5 text-white shadow-[0_24px_44px_rgba(17,24,39,0.28)]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-violet-100/80">Cobros</p>
        <h1 className="mt-2 text-3xl font-bold">{cop(monthlyFixed)}</h1>
        <p className="mt-1 text-sm text-violet-100/80">Cobros fijos al mes</p>
      </header>

      {warnings.length > 0 && (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {warnings.map((w) => (
            <p key={w.name} className="mb-1 last:mb-0">
              ⚠️ En los próximos 30 días {w.name} necesita {cop(w.needed)} y tiene {cop(w.balance)}. Faltan {cop(w.short)}.
            </p>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Lo que viene</h2>
        <UpcomingList items={upcoming.items.filter((i) => i.days <= 30)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mis cobros fijos</h2>
        {recurring.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">Aún no tienes cobros fijos.</p>
        ) : (
          <div className="space-y-2">
            {recurring.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="font-medium text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-500">Cada día {r.day_of_month}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{cop(r.amount)}</p>
                  <DeleteRecurringButton id={r.id} name={r.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <RecurringForm pockets={pockets} categories={categories} />
    </main>
  )
}
