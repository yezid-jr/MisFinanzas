'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { todayBogota } from '@/lib/format'
import type { DebtKind, IncomeSource } from '@/lib/types'

export type ActionResult = { ok: true } | { ok: false; error: string }

function friendly(message: string) {
  if (message.includes('SALDO_INSUFICIENTE')) {
    return 'Esa caja no tiene saldo suficiente. Haz primero una transferencia desde otra caja.'
  }
  return message
}

const valid = (n: number) => Number.isFinite(n) && n > 0
const done = (): ActionResult => {
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function registerIncome(input: {
  amount: number
  source: IncomeSource
  date: string
  note?: string
}): Promise<ActionResult> {
  if (!valid(input.amount)) return { ok: false, error: 'Monto inválido' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('register_weekly_income', {
    p_amount: input.amount,
    p_source: input.source,
    p_date: input.date,
    p_note: input.note || null,
  })
  if (error) return { ok: false, error: friendly(error.message) }
  return done()
}

export async function registerExpense(input: {
  amount: number
  pocketId: string
  categoryId: string | null
  date: string
  note?: string
}): Promise<ActionResult> {
  if (!valid(input.amount)) return { ok: false, error: 'Monto inválido' }
  if (!input.pocketId) return { ok: false, error: 'Elige una caja' }
  const supabase = await createClient()
  const { error } = await supabase.from('movements').insert({
    kind: 'expense',
    pocket_id: input.pocketId,
    amount: -input.amount,
    category_id: input.categoryId || null,
    occurred_on: input.date,
    note: input.note || null,
  })
  if (error) return { ok: false, error: friendly(error.message) }
  return done()
}

export async function transferBetweenPockets(input: {
  fromId: string
  toId: string
  amount: number
  date: string
  note?: string
}): Promise<ActionResult> {
  if (!valid(input.amount)) return { ok: false, error: 'Monto inválido' }
  if (!input.fromId || !input.toId) return { ok: false, error: 'Elige origen y destino' }
  if (input.fromId === input.toId) return { ok: false, error: 'Origen y destino deben ser distintos' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('transfer_between_pockets', {
    p_from: input.fromId,
    p_to: input.toId,
    p_amount: input.amount,
    p_date: input.date,
    p_note: input.note || null,
  })
  if (error) return { ok: false, error: friendly(error.message) }
  return done()
}

export async function registerDebt(input: {
  name: string
  kind: DebtKind
  amount: number
  rateEa: number | null
  cutoffDay: number
  dueDay: number
  notes?: string
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: 'Escribe el nombre de la deuda' }
  if (!valid(input.amount)) return { ok: false, error: 'El saldo de la deuda debe ser mayor a cero' }
  if (input.cutoffDay < 1 || input.cutoffDay > 31) return { ok: false, error: 'Día de corte inválido' }
  if (input.dueDay < 1 || input.dueDay > 31) return { ok: false, error: 'Día de pago inválido' }

  const supabase = await createClient()
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .insert({
      name: input.name.trim(),
      kind: input.kind,
      credit_limit: input.amount,
      rate_ea: input.rateEa,
      cutoff_day: input.cutoffDay,
      due_day: input.dueDay,
      notes: input.notes || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (debtError) return { ok: false, error: friendly(debtError.message) }

  const { error: entryError } = await supabase.from('debt_entries').insert({
    debt_id: debt.id,
    kind: 'opening',
    amount: input.amount,
    note: 'Saldo inicial',
    occurred_on: todayBogota(),
  })

  if (entryError) return { ok: false, error: friendly(entryError.message) }

  revalidatePath('/deudas', 'page')
  return done()
}

export async function payDebt(input: {
  debtId: string
  pocketId: string
  amount: number
  date: string
  installmentId?: string | null
  note?: string
}): Promise<ActionResult> {
  if (!valid(input.amount)) return { ok: false, error: 'Monto inválido' }
  if (!input.pocketId) return { ok: false, error: 'Elige de qué caja sale el pago' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('pay_debt', {
    p_debt: input.debtId,
    p_pocket: input.pocketId,
    p_amount: input.amount,
    p_date: input.date,
    p_note: input.note || null,
  })

  if (error) {
    const fallback = await supabase.from('debt_entries').insert({
      debt_id: input.debtId,
      kind: 'payment',
      amount: -input.amount,
      occurred_on: input.date,
      note: input.note || null,
    })
    if (fallback.error) return { ok: false, error: friendly(fallback.error.message) }
  }

  if (input.installmentId) {
    await supabase.from('debt_installments').update({ paid_at: input.date }).eq('id', input.installmentId)
  }

  revalidatePath('/deudas', 'page')
  return done()
}

export async function addDebtEntry(input: {
  debtId: string
  kind: 'charge' | 'interest' | 'fee'
  amount: number
  date: string
  note?: string
}): Promise<ActionResult> {
  if (!valid(input.amount)) return { ok: false, error: 'Monto inválido' }
  const supabase = await createClient()
  const { error } = await supabase.from('debt_entries').insert({
    debt_id: input.debtId,
    kind: input.kind,
    amount: input.amount,
    occurred_on: input.date,
    note: input.note || null,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/deudas', 'page')
  return done()
}

export async function syncDebtBalance(input: {
  debtId: string
  realBalance: number
  date: string
}): Promise<ActionResult> {
  if (!Number.isFinite(input.realBalance)) return { ok: false, error: 'Saldo real inválido' }
  const supabase = await createClient()
  const { error } = await supabase.from('debt_entries').insert({
    debt_id: input.debtId,
    kind: 'adjustment',
    amount: input.realBalance,
    occurred_on: input.date,
    note: 'Saldo real sincronizado',
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/deudas', 'page')
  return done()
}

export async function createRecurring(input: {
  name: string
  amount: number
  dayOfMonth: number
  pocketId: string
  categoryId: string | null
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: 'Ponle un nombre' }
  if (!valid(input.amount)) return { ok: false, error: 'Monto inválido' }
  if (!(input.dayOfMonth >= 1 && input.dayOfMonth <= 31)) return { ok: false, error: 'Día inválido' }
  if (!input.pocketId) return { ok: false, error: 'Elige una caja' }

  const supabase = await createClient()
  const { error } = await supabase.from('recurring_charges').insert({
    name: input.name.trim(),
    amount: input.amount,
    day_of_month: input.dayOfMonth,
    pocket_id: input.pocketId,
    category_id: input.categoryId || null,
    is_active: true,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/cobros', 'page')
  return done()
}

export async function payRecurring(input: { id: string; due: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: charge, error: readError } = await supabase
    .from('recurring_charges')
    .select('name,amount,pocket_id,category_id')
    .eq('id', input.id)
    .single()

  if (readError) return { ok: false, error: readError.message }

  const { error } = await supabase.from('movements').insert({
    kind: 'expense',
    pocket_id: charge.pocket_id,
    amount: -Number(charge.amount),
    category_id: charge.category_id,
    occurred_on: input.due,
    note: charge.name,
  })

  if (error) return { ok: false, error: friendly(error.message) }

  await supabase.from('recurring_charges').update({ last_posted_on: input.due }).eq('id', input.id)
  revalidatePath('/cobros', 'page')
  return done()
}

export async function deleteRecurring(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('recurring_charges').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/cobros', 'page')
  return done()
}

export async function reconcilePockets(input: { items: { pocketId: string; real: number }[]; date: string }): Promise<ActionResult> {
  const supabase = await createClient()
  for (const item of input.items) {
    const { error } = await supabase.rpc('reconcile_pocket', {
      p_pocket: item.pocketId,
      p_real: item.real,
      p_date: input.date,
    })
    if (error) {
      const diff = item.real
      const result = await supabase.from('movements').insert({
        kind: 'yield',
        pocket_id: item.pocketId,
        amount: diff,
        occurred_on: input.date,
        note: 'Conciliación',
      })
      if (result.error) return { ok: false, error: result.error.message }
    }
  }
  revalidatePath('/conciliar', 'page')
  return done()
}

export async function deleteMovementGroup(groupId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error: e1 } = await supabase.from('debt_entries').delete().eq('group_id', groupId)
  if (e1) return { ok: false, error: e1.message }
  const { error: e2 } = await supabase.from('movements').delete().eq('group_id', groupId)
  if (e2) return { ok: false, error: e2.message }
  revalidatePath('/historial', 'page')
  return done()
}