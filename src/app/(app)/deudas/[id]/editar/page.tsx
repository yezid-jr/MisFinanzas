import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Debt, Installment, PocketLite } from '@/lib/types'
import { EditDebtForm, InstallmentsEditor } from './edit-debt-form'

export default async function EditDebtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [debtRes, pocketsRes, instRes] = await Promise.all([
    supabase.from('debts').select('*').eq('id', id).maybeSingle(),
    supabase.from('pocket_balances').select('pocket_id,name,emoji,balance').order('priority'),
    supabase.from('debt_installments').select('*').eq('debt_id', id).order('due_on'),
  ])
  if (!debtRes.data) notFound()

  const debt = debtRes.data as Debt

  return (
    <main className="space-y-4">
      <Link href="/deudas" className="text-sm text-slate-500">
        ‹ Deudas
      </Link>
      <h1 className="text-2xl font-bold">Editar deuda</h1>
      <EditDebtForm debt={debt} pockets={(pocketsRes.data ?? []) as PocketLite[]} />
      {debt.kind !== 'credit_card' && (
        <InstallmentsEditor debtId={debt.id} installments={(instRes.data ?? []) as Installment[]} />
      )}
    </main>
  )
}