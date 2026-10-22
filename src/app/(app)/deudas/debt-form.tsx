'use client'

import { useState, useTransition } from 'react'
import { registerDebt } from '@/lib/actions'
import { cop } from '@/lib/format'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const kinds = [
  { value: 'student_loan', label: 'ICETEX' },
  { value: 'credit_card', label: 'Tarjeta' },
  { value: 'bnpl', label: 'Addi / BNPL' },
  { value: 'person', label: 'Personal' },
  { value: 'other', label: 'Otra' },
] as const

export default function DebtForm() {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<(typeof kinds)[number]['value']>('student_loan')
  const [amount, setAmount] = useState('')
  const [rateEa, setRateEa] = useState('')
  const [cutoffDay, setCutoffDay] = useState('28')
  const [dueDay, setDueDay] = useState('16')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

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
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  return (
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resumen</p>
          <p className="mt-2 font-semibold text-slate-900">{cop(Number(amount))}</p>
        </div>
      )}

      <Feedback result={result} />
      <SubmitButton pending={pending}>Guardar deuda</SubmitButton>
    </form>
  )
}
