import { createClient } from '@/lib/supabase/server'
import type { PocketBalance } from '@/lib/types'
import TransferForm from './transfer-form'

export default async function TransferPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('pocket_balances').select('*').order('priority')

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Mover plata entre cajas</h1>
      <TransferForm pockets={(data ?? []) as PocketBalance[]} />
    </main>
  )
}