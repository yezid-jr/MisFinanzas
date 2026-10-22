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
      <h1 className="text-2xl font-bold">Registrar gasto</h1>
      <ExpenseForm
        pockets={(pockets.data ?? []) as PocketBalance[]}
        categories={(categories.data ?? []) as Category[]}
      />
    </main>
  )
}