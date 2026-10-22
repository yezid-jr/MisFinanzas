import { createClient } from '@/lib/supabase/server'
import type { Pocket } from '@/lib/types'
import IncomeForm from './income-form'

export default async function IncomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pockets')
    .select('id,name,emoji,priority,pct_work,pct_tattoo')
    .eq('is_active', true)
    .order('priority')
    .order('name')

  return (
    <main className="space-y-4">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Ingreso</p>
        <h1 className="mt-2 text-3xl font-bold">Registrar ingreso</h1>
      </header>
      <div className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <IncomeForm pockets={(data ?? []) as Pocket[]} />
      </div>
    </main>
  )
}