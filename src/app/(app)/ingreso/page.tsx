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
      <h1 className="text-2xl font-bold">Registrar ingreso</h1>
      <IncomeForm pockets={(data ?? []) as Pocket[]} />
    </main>
  )
}