import { createClient } from '@/lib/supabase/server'
import type { PocketBalance } from '@/lib/types'
import ReconcileForm from './reconcile-form'

export default async function ReconcilePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('pocket_balances').select('*').order('priority')

  return (
    <main className="space-y-5">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Conciliar</p>
        <h1 className="mt-2 text-3xl font-bold">Nu y Bancolombia</h1>
      </header>

      <p className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 text-sm text-[#8a8a93] shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        Escribe el saldo real que ves hoy en cada cajita. Si es mayor al de la app, la diferencia se registra como rendimiento; si es menor, como ajuste.
      </p>

      <div className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <ReconcileForm pockets={(data ?? []) as PocketBalance[]} />
      </div>
    </main>
  )
}
