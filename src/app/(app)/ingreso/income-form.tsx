'use client'

import { useMemo, useState, useTransition } from 'react'
import { BriefcaseBusiness, PenTool, Sparkles } from 'lucide-react'
import { registerIncome } from '@/lib/actions'
import { cop, parsePesos, todayBogota } from '@/lib/format'
import type { IncomeSource, Pocket } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const SOURCES: { value: IncomeSource; label: string; icon: typeof BriefcaseBusiness }[] = [
  { value: 'work', label: 'Trabajo', icon: BriefcaseBusiness },
  { value: 'tattoo', label: 'Tatuaje', icon: PenTool },
  { value: 'other', label: 'Otro', icon: Sparkles },
]

// Mismo cálculo que la función register_weekly_income de la base de datos
function splitIncome(amount: number, pockets: Pocket[], source: IncomeSource) {
  const key = source === 'tattoo' ? 'pct_tattoo' : 'pct_work'
  let assigned = 0
  const rows = pockets
    .filter((p) => Number(p[key]) > 0)
    .map((p) => {
      const share = Math.floor(+((amount * Number(p[key])) / 100).toFixed(6))
      assigned += share
      return { pocket: p, pct: Number(p[key]), share }
    })
  const rest = amount - assigned
  if (rows.length > 0 && rest > 0) rows[0].share += rest // el residuo va a la caja de mayor prioridad
  return rows
}

export default function IncomeForm({ pockets }: { pockets: Pocket[] }) {
  const [amountText, setAmountText] = useState('')
  const [source, setSource] = useState<IncomeSource>('work')
  const [date, setDate] = useState(todayBogota())
  const [note, setNote] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const amount = parsePesos(amountText)
  const preview = useMemo(() => splitIncome(amount, pockets, source), [amount, pockets, source])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await registerIncome({ amount, source, date, note })
      if (res.ok) {
        setResult({ ok: true, message: `Listo: ${cop(amount)} repartidos en tus cajas ✅` })
        setAmountText('')
        setNote('')
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="¿Cuánto recibiste?">
        <input
          inputMode="numeric"
          placeholder="250000"
          className={inputClass}
          value={amount ? amount.toLocaleString('es-CO') : ''}
          onChange={(e) => setAmountText(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-3 gap-2">
        {SOURCES.map((s) => {
          const Icon = s.icon

          return (
            <button
              type="button"
              key={s.value}
              onClick={() => setSource(s.value)}
              className={`flex items-center justify-center gap-1.5 rounded-2xl border px-2 py-2.5 text-sm font-medium transition-all ${
                source === s.value
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              {s.label}
            </button>
          )
        })}
      </div>

      <Field label="Fecha">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Nota (opcional)">
        <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {amount > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-600">Así se reparte</p>
          <ul className="space-y-1.5 text-sm">
            {preview.map(({ pocket, pct, share }) => (
              <li key={pocket.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 truncate">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <BriefcaseBusiness className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="truncate">
                    {pocket.name} <span className="text-slate-400">({pct}%)</span>
                  </span>
                </span>
                <span className="font-medium">{cop(share)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Feedback result={result} />
      <SubmitButton pending={pending}>Repartir en mis cajas</SubmitButton>
    </form>
  )
}