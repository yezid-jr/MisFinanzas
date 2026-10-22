'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { registerExpense } from '@/lib/actions'
import { cop, parsePesos, todayBogota } from '@/lib/format'
import type { Category, PocketBalance } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

export default function ExpenseForm({
  pockets,
  categories,
}: {
  pockets: PocketBalance[]
  categories: Category[]
}) {
  const [amountText, setAmountText] = useState('')
  const [pocketId, setPocketId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(todayBogota())
  const [note, setNote] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const amount = parsePesos(amountText)
  const pocket = pockets.find((p) => p.pocket_id === pocketId)
  const insufficient = !!pocket && amount > Number(pocket.balance)

  function onCategoryChange(id: string) {
    setCategoryId(id)
    const suggested = categories.find((c) => c.id === id)?.default_pocket_id
    if (suggested) setPocketId(suggested) // sugiere la caja habitual de esa categoría
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await registerExpense({
        amount,
        pocketId,
        categoryId: categoryId || null,
        date,
        note,
      })
      if (res.ok) {
        setResult({ ok: true, message: `Gasto de ${cop(amount)} registrado ✅` })
        setAmountText('')
        setNote('')
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="¿Cuánto gastaste?">
        <input
          inputMode="numeric"
          placeholder="15000"
          className={inputClass}
          value={amount ? amount.toLocaleString('es-CO') : ''}
          onChange={(e) => setAmountText(e.target.value)}
        />
      </Field>

      <Field label="Categoría">
        <select className={inputClass} value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="¿De qué caja sale?">
        <select className={inputClass} value={pocketId} onChange={(e) => setPocketId(e.target.value)} required>
          <option value="">Elige una caja…</option>
          {pockets.map((p) => (
            <option key={p.pocket_id} value={p.pocket_id}>
              {p.name} · {cop(p.balance)}
            </option>
          ))}
        </select>
      </Field>

      {insufficient && (
        <p className="rounded-lg border border-[#d97724]/20 bg-[#d97724]/10 p-3 text-sm text-[#f7c07a]">
          {pocket?.name} solo tiene {cop(pocket?.balance)}.{' '}
          <Link href="/transferir" className="font-semibold underline">
            Muévele plata desde otra caja
          </Link>
          .
        </p>
      )}

      <Field label="Fecha">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Nota (opcional)">
        <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <Feedback result={result} />
      <SubmitButton pending={pending}>Guardar gasto</SubmitButton>
    </form>
  )
}