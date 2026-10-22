'use client'

import { useState, type FormEvent } from 'react'
import { reconcilePockets } from '@/lib/actions'
import { cop2, parseMoney, todayBogota } from '@/lib/format'
import type { PocketBalance } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const asText = (n: number) => Number(n).toFixed(2).replace('.', ',')

export default function ReconcileForm({ pockets }: { pockets: PocketBalance[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(pockets.map((p) => [p.pocket_id, asText(p.balance)]))
  )
  const [date, setDate] = useState(todayBogota())
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, setPending] = useState(false)

  const diffOf = (p: PocketBalance) =>
    Math.round((parseMoney(values[p.pocket_id] ?? '') - Number(p.balance)) * 100) / 100

  const changed = pockets.filter((p) => diffOf(p) !== 0)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (changed.length === 0) {
      setResult({ ok: false, message: 'No cambiaste ningún saldo.' })
      return
    }

    setPending(true)
    const res = await reconcilePockets({
      date,
      items: changed.map((p) => ({ pocketId: p.pocket_id, real: parseMoney(values[p.pocket_id]) })),
    })
    setPending(false)

    setResult(
      res.ok ? { ok: true, message: `Conciliadas ${changed.length} caja(s) ✅` } : { ok: false, message: res.error }
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      {pockets.map((p) => {
        const diff = diffOf(p)
        return (
          <div key={p.pocket_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">{p.emoji ?? '💰'} {p.name}</p>
                <p className="text-xs text-slate-500">App: {cop2(p.balance)}</p>
              </div>
            </div>
            <div className="mt-3">
              <Field label="Saldo real">
                <input
                  className={inputClass}
                  value={values[p.pocket_id] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [p.pocket_id]: e.target.value }))}
                />
              </Field>
            </div>
            {diff !== 0 && (
              <p className={`mt-2 text-xs ${diff > 0 ? 'text-sky-600' : 'text-orange-600'}`}>
                {diff > 0 ? '📈 Rendimiento' : '⚖️ Ajuste'}: {cop2(diff)}
              </p>
            )}
          </div>
        )
      })}

      <Field label="Fecha de conciliación">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Feedback result={result} />
      <SubmitButton pending={pending}>Conciliar {changed.length > 0 ? `(${changed.length})` : ''}</SubmitButton>
    </form>
  )
}
