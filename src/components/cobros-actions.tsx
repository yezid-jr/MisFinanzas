'use client'

import { useState, type FormEvent } from 'react'
import { createRecurring, deleteRecurring, payRecurring } from '@/lib/actions'
import { cop, parsePesos } from '@/lib/format'
import type { Category, PocketLite } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

export function PayRecurringButton({ id, due, amount }: { id: string; due: string; amount: number }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          const res = await payRecurring({ id, due })
          setError(res.ok ? null : res.error)
          setPending(false)
        }}
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Registrando…' : `Registrar cobro de ${cop(amount)}`}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export function DeleteRecurringButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm(`¿Eliminar el cobro "${name}"?`)) return
        setPending(true)
        await deleteRecurring(id)
        setPending(false)
      }}
      className="text-xs text-slate-400 underline disabled:opacity-50"
    >
      {pending ? 'Eliminando…' : 'Eliminar'}
    </button>
  )
}

export function RecurringForm({ pockets, categories }: { pockets: PocketLite[]; categories: Category[] }) {
  const [name, setName] = useState('')
  const [amountText, setAmountText] = useState('')
  const [day, setDay] = useState('')
  const [pocketId, setPocketId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, setPending] = useState(false)

  const amount = parsePesos(amountText)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const res = await createRecurring({
      name,
      amount,
      dayOfMonth: Number(day),
      pocketId,
      categoryId: categoryId || null,
    })
    setPending(false)

    if (res.ok) {
      setResult({ ok: true, message: 'Cobro agregado ✅' })
      setName('')
      setAmountText('')
      setDay('')
    } else {
      setResult({ ok: false, message: res.error })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Agregar cobro fijo</h3>

      <Field label="Nombre">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Monto">
          <input
            inputMode="numeric"
            className={inputClass}
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            placeholder="25000"
          />
        </Field>
        <Field label="Día">
          <input
            inputMode="numeric"
            className={inputClass}
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="15"
          />
        </Field>
      </div>

      <Field label="Caja">
        <select className={inputClass} value={pocketId} onChange={(e) => setPocketId(e.target.value)}>
          <option value="">Elige una caja…</option>
          {pockets.map((p) => (
            <option key={p.pocket_id} value={p.pocket_id}>
              {p.emoji} {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Categoría">
        <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </Field>

      {result && <Feedback result={result} />}
      <SubmitButton pending={pending}>Agregar cobro</SubmitButton>
    </form>
  )
}
