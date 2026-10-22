import { createClient } from '@/lib/supabase/server'
import type { Category, PocketBalance } from '@/lib/types'
import ExpenseForm from './expense-form'

export default async function ExpensePage() {
  const supabase = await createClient()
  const [pockets, categories] = await Promise.all([
    supabase.from('pocket_balances').select('*').order('priority'),
    supabase.from('categories').select('id,name,emoji,default_pocket_id').order('name'),
  ])

  return (
    <main className="space-y-4">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Gasto</p>
        <h1 className="mt-2 text-3xl font-bold">Registrar gasto</h1>
      </header>
      <div className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <ExpenseForm
          pockets={(pockets.data ?? []) as PocketBalance[]}
          categories={(categories.data ?? []) as Category[]}
        />
      </div>
    </main>
  )
}