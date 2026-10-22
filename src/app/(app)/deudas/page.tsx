'use client'

import { useEffect, useState, useTransition } from 'react'
import { registerDebt } from '@/lib/actions'
import { cop } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import type { Debt } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const labelByKind: Record<string, string> = {
  student_loan: 'ICETEX',
  credit_card: 'Tarjeta',
  bnpl: 'BNPL',
  person: 'Personal',
  other: 'Otra',
}

const kinds = [
  { value: 'student_loan', label: 'ICETEX' },
  { value: 'credit_card', label: 'Tarjeta' },
  { value: 'bnpl', label: 'Addi / BNPL' },
  { value: 'person', label: 'Personal' },
  { value: 'other', label: 'Otra' },
] as const

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<(typeof kinds)[number]['value']>('student_loan')
  const [amount, setAmount] = useState('')
  const [rateEa, setRateEa] = useState('')
  const [cutoffDay, setCutoffDay] = useState('28')
  const [dueDay, setDueDay] = useState('16')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const loadDebts = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('debts').select('*').eq('is_active', true).order('name')
      setDebts((data ?? []) as Debt[])
      setLoading(false)
    }

    loadDebts()
  }, [])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount.replace(/[^\d]/g, ''))
    const parsedRate = rateEa ? Number(rateEa.replace(',', '.')) : null

    startTransition(async () => {
      const res = await registerDebt({
        name: name.trim(),
        kind,
        amount: parsedAmount,
        rateEa: parsedRate,
        cutoffDay: Number(cutoffDay || 0),
        dueDay: Number(dueDay || 0),
        notes: notes.trim() || undefined,
      })

      if (res.ok) {
        setResult({ ok: true, message: 'Deuda registrada correctamente ✅' })
        setName('')
        setAmount('')
        setRateEa('')
        setNotes('')
        const supabase = createClient()
        const { data } = await supabase.from('debts').select('*').eq('is_active', true).order('name')
        setDebts((data ?? []) as Debt[])
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  const total = debts.reduce((sum, debt) => sum + Number(debt.credit_limit ?? 0), 0)

  return (
    <main className="space-y-5">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a93]">Deudas</p>
        <h1 className="mt-2 text-3xl font-bold">{cop(total)}</h1>
        <p className="mt-1 text-sm text-[#8a8a93]">Saldo total comprometido</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Resumen</h2>
        {loading ? (
          <p className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 text-sm text-[#8a8a93]">Cargando deudas…</p>
        ) : debts.length === 0 ? (
          <p className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 text-sm text-[#8a8a93]">
            Aún no registras deudas. Agrega la primera para empezar a controlarlas.
          </p>
        ) : (
          debts.map((debt) => (
            <article key={debt.id} className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{debt.name}</p>
                  <p className="mt-1 text-xs text-[#8a8a93]">{labelByKind[debt.kind] ?? debt.kind}</p>
                </div>
                <span className="rounded-full bg-[#d97724]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f7c07a]">
                  {debt.due_day ? `Vence ${debt.due_day}` : 'Sin fecha'}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a8a93]">Saldo</p>
                  <p className="mt-1 text-xl font-bold text-white">{cop(Number(debt.credit_limit ?? 0))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a8a93]">Tasa EA</p>
                  <p className="mt-1 text-sm font-semibold text-[#f7c07a]">
                    {debt.rate_ea != null ? `${debt.rate_ea}%` : '—'}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Agregar deuda</h2>
        <div className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nombre de la deuda">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="ICETEX" required />
            </Field>

            <Field label="Tipo">
              <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as (typeof kinds)[number]['value'])}>
                {kinds.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Saldo actual">
              <input
                inputMode="numeric"
                className={inputClass}
                value={amount ? Number(amount).toLocaleString('es-CO') : ''}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="35000000"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tasa EA %">
                <input
                  inputMode="decimal"
                  className={inputClass}
                  value={rateEa}
                  onChange={(e) => setRateEa(e.target.value)}
                  placeholder="28.15"
                />
              </Field>

              <Field label="Día de corte">
                <input type="number" min={1} max={31} className={inputClass} value={cutoffDay} onChange={(e) => setCutoffDay(e.target.value)} />
              </Field>
            </div>

            <Field label="Día límite de pago">
              <input type="number" min={1} max={31} className={inputClass} value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
            </Field>

            <Field label="Nota (opcional)">
              <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pago en 3 cuotas" />
            </Field>

            {amount && (
              <div className="rounded-2xl border border-[#282830] bg-[#0d0d0e] p-3 text-sm text-[#8a8a93]">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a8a93]">Resumen</p>
                <p className="mt-2 font-semibold text-white">{cop(Number(amount))}</p>
              </div>
            )}

            <Feedback result={result} />
            <SubmitButton pending={pending}>Guardar deuda</SubmitButton>
          </form>
        </div>
      </section>
    </main>
  )
}
