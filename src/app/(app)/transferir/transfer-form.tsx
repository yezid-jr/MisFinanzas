'use client'

import { useState, useTransition } from 'react'
import { transferBetweenPockets } from '@/lib/actions'
import { cop, parsePesos, todayBogota } from '@/lib/format'
import type { PocketBalance } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

export default function TransferForm({ pockets }: { pockets: PocketBalance[] }) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amountText, setAmountText] = useState('')
  const [date, setDate] = useState(todayBogota())
  const [note, setNote] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const amount = parsePesos(amountText)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await transferBetweenPockets({ fromId, toId, amount, date, note })
      if (res.ok) {
        setResult({ ok: true, message: `Movidos ${cop(amount)} ✅` })
        setAmountText('')
        setNote('')
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  const options = pockets.map((p) => (
    <option key={p.pocket_id} value={p.pocket_id}>
      {p.name} · {cop(p.balance)}
    </option>
  ))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Desde">
        <select className={inputClass} value={fromId} onChange={(e) => setFromId(e.target.value)} required>
          <option value="">Elige la caja de origen…</option>
          {options}
        </select>
      </Field>
      <Field label="Hacia">
        <select className={inputClass} value={toId} onChange={(e) => setToId(e.target.value)} required>
          <option value="">Elige la caja de destino…</option>
          {options}
        </select>
      </Field>
      <Field label="Monto">
        <input
          inputMode="numeric"
          placeholder="20000"
          className={inputClass}
          value={amount ? amount.toLocaleString('es-CO') : ''}
          onChange={(e) => setAmountText(e.target.value)}
        />
      </Field>
      <Field label="Fecha">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Nota (opcional)">
        <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <Feedback result={result} />
      <SubmitButton pending={pending}>Mover plata</SubmitButton>
    </form>
  )
}