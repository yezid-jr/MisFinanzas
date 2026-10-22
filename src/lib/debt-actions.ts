'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { addMonthsKeepDay } from '@/lib/dates'
import { round2, splitInstallments } from '@/lib/debt-math'
import type { DebtKind } from '@/lib/types'

type Result = { ok: true } | { ok: false; error: string }
const fail = (error: string): Result => ({ ok: false, error })
const done = (): Result => {
  revalidatePath('/', 'layout')
  return { ok: true }
}
const validDay = (n?: number | null) => n == null || (Number.isInteger(n) && n >= 1 && n <= 31)
const validDate = (s?: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)

export type NewDebtInput = {
  kind: DebtKind
  name: string
  defaultPocketId: string | null
  notes?: string
  rateEa?: number | null
  creditLimit?: number | null
  cutoffDay?: number | null
  dueDay?: number | null
  /** tarjeta, deuda personal y préstamos: saldo actual */
  balance?: number
  /** compra a cuotas: capital, intereses y costos */
  principal?: number
  interest?: number
  fees?: number
  installments?: number
  /** compra a cuotas: fecha de la 1ª cuota. Deuda personal: fecha pactada (opcional) */
  firstDue?: string
  date: string
}

export async function createDebt(i: NewDebtInput): Promise<Result> {
  const name = i.name.trim()
  if (!name) return fail('Ponle un nombre')
  if (!validDay(i.cutoffDay) || !validDay(i.dueDay)) return fail('Los días van de 1 a 31')
  if (!validDate(i.date)) return fail('Fecha inválida')

  const entries: { kind: 'opening' | 'interest' | 'fee'; amount: number; note: string }[] = []
  let installments: { due_on: string; amount: number }[] = []

  if (i.kind === 'credit_card') {
    if (!i.creditLimit || i.creditLimit <= 0) return fail('Escribe el cupo de la tarjeta')
  }

  if (i.kind === 'bnpl') {
    const principal = i.principal ?? 0
    const interest = i.interest ?? 0
    const fees = i.fees ?? 0
    const count = i.installments ?? 0
    if (!(principal > 0)) return fail('Escribe cuánto te financiaron')
    if (interest < 0 || fees < 0) return fail('Los montos no pueden ser negativos')
    if (!Number.isInteger(count) || count < 1 || count > 60) return fail('Número de cuotas inválido (1 a 60)')
    if (!validDate(i.firstDue)) return fail('Indica la fecha de la primera cuota')

    entries.push({ kind: 'opening', amount: principal, note: 'Capital financiado' })
    if (interest > 0) entries.push({ kind: 'interest', amount: interest, note: 'Intereses' })
    if (fees > 0) entries.push({ kind: 'fee', amount: fees, note: 'Fianza y costos' })
    installments = splitInstallments(round2(principal + interest + fees), count, i.firstDue as string)
  } else {
    const balance = i.balance ?? 0
    if (balance < 0) return fail('El saldo no puede ser negativo')
    if (balance > 0) entries.push({ kind: 'opening', amount: balance, note: 'Saldo inicial' })
    if (i.kind === 'person' && i.firstDue && balance > 0) {
      if (!validDate(i.firstDue)) return fail('Fecha pactada inválida')
      installments = [{ due_on: i.firstDue, amount: balance }]
    }
  }

  const supabase = await createClient()
  const { data: debt, error } = await supabase
    .from('debts')
    .insert({
      name,
      kind: i.kind,
      rate_ea: i.rateEa ?? null,
      credit_limit: i.creditLimit ?? null,
      cutoff_day: i.cutoffDay ?? null,
      due_day: i.dueDay ?? null,
      default_pocket_id: i.defaultPocketId || null,
      notes: i.notes?.trim() || null,
    })
    .select('id')
    .single()
  if (error || !debt) return fail(error?.message ?? 'No se pudo crear la deuda')

  if (entries.length > 0) {
    const { error: e1 } = await supabase
      .from('debt_entries')
      .insert(entries.map((e) => ({ debt_id: debt.id, kind: e.kind, amount: e.amount, note: e.note, occurred_on: i.date })))
    if (e1) {
      await supabase.from('debts').delete().eq('id', debt.id)
      return fail(e1.message)
    }
  }
  if (installments.length > 0) {
    const { error: e2 } = await supabase
      .from('debt_installments')
      .insert(installments.map((c) => ({ debt_id: debt.id, due_on: c.due_on, amount: c.amount })))
    if (e2) {
      await supabase.from('debts').delete().eq('id', debt.id)
      return fail(e2.message)
    }
  }
  return done()
}

export async function updateDebt(input: {
  id: string
  name: string
  rateEa: number | null
  creditLimit: number | null
  cutoffDay: number | null
  dueDay: number | null
  defaultPocketId: string | null
  notes: string
}): Promise<Result> {
  if (!input.name.trim()) return fail('Ponle un nombre')
  if (!validDay(input.cutoffDay) || !validDay(input.dueDay)) return fail('Los días van de 1 a 31')
  const supabase = await createClient()
  const { error } = await supabase
    .from('debts')
    .update({
      name: input.name.trim(),
      rate_ea: input.rateEa,
      credit_limit: input.creditLimit,
      cutoff_day: input.cutoffDay,
      due_day: input.dueDay,
      default_pocket_id: input.defaultPocketId || null,
      notes: input.notes.trim() || null,
    })
    .eq('id', input.id)
  if (error) return fail(error.message)
  return done()
}

export async function setDebtActive(id: string, active: boolean): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('debts').update({ is_active: active }).eq('id', id)
  if (error) return fail(error.message)
  return done()
}

/** Borra la deuda con sus movimientos de deuda y cuotas. Los pagos ya hechos desde tus cajas se conservan. */
export async function deleteDebt(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('debts').delete().eq('id', id)
  if (error) return fail(error.message)
  return done()
}

export async function addInstallments(input: {
  debtId: string
  count: number
  amountEach: number
  firstDue: string
}): Promise<Result> {
  if (!Number.isInteger(input.count) || input.count < 1 || input.count > 60) return fail('Número de cuotas inválido (1 a 60)')
  if (!(input.amountEach > 0)) return fail('Monto inválido')
  if (!validDate(input.firstDue)) return fail('Fecha inválida')
  const supabase = await createClient()
  const rows = Array.from({ length: input.count }, (_, k) => ({
    debt_id: input.debtId,
    due_on: addMonthsKeepDay(input.firstDue, k),
    amount: input.amountEach,
  }))
  const { error } = await supabase.from('debt_installments').insert(rows)
  if (error) return fail(error.message)
  return done()
}

export async function deleteInstallment(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('debt_installments').delete().eq('id', id)
  if (error) return fail(error.message)
  return done()
}