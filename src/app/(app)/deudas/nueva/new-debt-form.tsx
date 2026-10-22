'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createDebt } from '@/lib/debt-actions'
import { round2 } from '@/lib/debt-math'
import { cop, cop2, parseMoney, todayBogota } from '@/lib/format'
import type { DebtKind, PocketLite } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const TYPES: { kind: DebtKind; icon: string; title: string; hint: string }[] = [
  { kind: 'credit_card', icon: '💳', title: 'Tarjeta de crédito', hint: 'Con cupo, fecha de corte y fecha de pago' },
  { kind: 'bnpl', icon: '🛍️', title: 'Compra a cuotas', hint: 'Addi y similares: cuotas fijas, sin fecha de corte' },
  { kind: 'person', icon: '🤝', title: 'Deuda personal', hint: 'Le debes a una persona: sin corte, cupo ni interés' },
  { kind: 'student_loan', icon: '🎓', title: 'Préstamo o crédito educativo', hint: 'Icetex, banco u otro préstamo' },
]

const EMPTY = {
  name: '',
  balance: '',
  limit: '',
  rate: '',
  cutoff: '',
  due: '',
  principal: '',
  interest: '',
  fees: '',
  count: '3',
  firstDue: '',
  notes: '',
}
type F = typeof EMPTY

const toDay = (s: string) => (s.trim() ? parseInt(s, 10) : null)
const toRate = (s: string) => (s.trim() ? parseMoney(s) : null)

export default function NewDebtForm({ pockets }: { pockets: PocketLite[] }) {
  const router = useRouter()
  const [kind, setKind] = useState<DebtKind | null>(null)
  const [f, setF] = useState<F>(EMPTY)
  const [pocketId, setPocketId] = useState('')
  const [date] = useState(todayBogota())
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const input = (
    k: keyof F,
    label: string,
    opts: { mode?: 'numeric' | 'decimal' | 'text'; placeholder?: string; type?: string } = {}
  ) => (
    <Field label={label}>
      <input
        className={inputClass}
        type={opts.type ?? 'text'}
        inputMode={opts.mode}
        placeholder={opts.placeholder}
        value={f[k]}
        onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))}
      />
    </Field>
  )

  const principal = parseMoney(f.principal)
  const total = round2(principal + parseMoney(f.interest) + parseMoney(f.fees))
  const count = parseInt(f.count, 10) || 0

  const pocketField = (
    <Field label="¿De qué caja la vas a pagar normalmente?">
      <select className={inputClass} value={pocketId} onChange={(e) => setPocketId(e.target.value)}>
        <option value="">Sin definir</option>
        {pockets.map((p) => (
          <option key={p.pocket_id} value={p.pocket_id}>
            {p.emoji} {p.name} · {cop(p.balance)}
          </option>
        ))}
      </select>
    </Field>
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kind) return
    startTransition(async () => {
      const res = await createDebt({
        kind,
        name: f.name,
        defaultPocketId: pocketId || null,
        notes: f.notes,
        rateEa: toRate(f.rate),
        creditLimit: f.limit.trim() ? parseMoney(f.limit) : null,
        cutoffDay: kind === 'credit_card' ? toDay(f.cutoff) : null,
        dueDay: kind === 'credit_card' ? toDay(f.due) : null,
        balance: parseMoney(f.balance),
        principal,
        interest: parseMoney(f.interest),
        fees: parseMoney(f.fees),
        installments: count,
        firstDue: f.firstDue || undefined,
        date,
      })
      if (res.ok) {
        router.push('/deudas')
        router.refresh()
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  if (!kind) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">¿Qué tipo de deuda es?</p>
        {TYPES.map((t) => (
          <button
            key={t.kind}
            onClick={() => setKind(t.kind)}
            className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <span className="text-3xl">{t.icon}</span>
            <span>
              <span className="block font-semibold">{t.title}</span>
              <span className="block text-xs text-slate-500">{t.hint}</span>
            </span>
          </button>
        ))}
      </div>
    )
  }

  const current = TYPES.find((t) => t.kind === kind)!

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
        <span className="font-medium">
          {current.icon} {current.title}
        </span>
        <button type="button" onClick={() => setKind(null)} className="text-xs text-slate-500 underline">
          Cambiar
        </button>
      </div>

      {kind === 'credit_card' && (
        <>
          {input('name', 'Nombre', { placeholder: 'Tarjeta Nu' })}
          {input('limit', 'Cupo total', { mode: 'numeric', placeholder: '1000000' })}
          {input('balance', 'Lo que debes hoy', { mode: 'decimal', placeholder: '800002' })}
          <div className="grid grid-cols-2 gap-3">
            {input('cutoff', 'Día de corte', { mode: 'numeric', placeholder: '28' })}
            {input('due', 'Día límite de pago', { mode: 'numeric', placeholder: '16' })}
          </div>
          {input('rate', 'Tasa de interés E.A. (%)', { mode: 'decimal', placeholder: '28,15' })}
          {pocketField}
        </>
      )}

      {kind === 'bnpl' && (
        <>
          {input('name', 'Nombre', { placeholder: 'Addi · celular' })}
          {input('principal', 'Cuánto te financiaron (capital)', { mode: 'decimal', placeholder: '600000' })}
          <div className="grid grid-cols-2 gap-3">
            {input('interest', 'Intereses totales', { mode: 'decimal', placeholder: '51848,25' })}
            {input('fees', 'Fianza y costos', { mode: 'decimal', placeholder: '101934,91' })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {input('count', 'Número de cuotas', { mode: 'numeric', placeholder: '3' })}
            {input('firstDue', 'Fecha de la 1ª cuota', { type: 'date' })}
          </div>
          {principal > 0 && count > 0 && (
            <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
              Total a pagar <b>{cop2(total)}</b> · {count} cuotas de ≈ <b>{cop2(total / count)}</b>
            </p>
          )}
          {input('limit', 'Cupo aprobado (opcional)', { mode: 'numeric', placeholder: '600000' })}
          {input('rate', 'Tasa E.A. (%) (opcional)', { mode: 'decimal', placeholder: '65' })}
          {pocketField}
        </>
      )}

      {kind === 'person' && (
        <>
          {input('name', 'A quién le debes', { placeholder: 'Ej. Juan' })}
          {input('balance', 'Cuánto le debes', { mode: 'decimal', placeholder: '150000' })}
          {input('firstDue', 'Fecha pactada de pago (opcional)', { type: 'date' })}
          {input('notes', 'Nota (opcional)', { placeholder: 'Para qué fue el préstamo' })}
          {pocketField}
        </>
      )}

      {kind === 'student_loan' && (
        <>
          {input('name', 'Nombre', { placeholder: 'Icetex' })}
          {input('balance', 'Saldo total hoy', { mode: 'decimal', placeholder: '34846655,95' })}
          {input('rate', 'Tasa de interés E.A. (%) (opcional)', { mode: 'decimal', placeholder: '5,1' })}
          {input('notes', 'Nota (opcional)', { placeholder: 'Empiezo a pagar en 2028' })}
          {pocketField}
        </>
      )}

      <Feedback result={result} />
      <SubmitButton pending={pending}>Crear deuda</SubmitButton>
    </form>
  )
}