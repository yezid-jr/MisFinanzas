import { createClient } from '@/lib/supabase/server'
import type { PocketBalance } from '@/lib/types'
import ReconcileForm from './reconcile-form'

export default async function ReconcilePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('pocket_balances').select('*').order('priority')

  return (
    <main className="space-y-5">
      <header className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#374151_100%)] p-5 text-white shadow-[0_24px_44px_rgba(15,23,42,0.28)]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-200/80">Conciliar</p>
        <h1 className="mt-2 text-3xl font-bold">Nu y Bancolombia</h1>
      </header>

      <p className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        Escribe el saldo real que ves hoy en cada cajita. Si es mayor al de la app, la diferencia se registra como rendimiento; si es menor, como ajuste.
      </p>

      <ReconcileForm pockets={(data ?? []) as PocketBalance[]} />
    </main>
  )
}
