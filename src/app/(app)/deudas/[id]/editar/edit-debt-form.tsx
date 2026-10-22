'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { addInstallments, deleteDebt, deleteInstallment, setDebtActive, updateDebt } from '@/lib/debt-actions'
import { cop, cop2, parseMoney } from '@/lib/format'
import { shortDate } from '@/lib/dates'
import type { Debt, Installment, PocketLite } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const toDay = (s: string) => (s.trim() ? parseInt(s, 10) : null)
const toRate = (s: string) => (s.trim() ? parseMoney(s) : null)
const asText = (n: number | null) => (n == null ? '' : String(n).replace('.', ','))

export function EditDebtForm({ debt, pockets }: { debt: Debt; pockets: PocketLite[] }) {
  const router = useRouter()
  const [name, setName] = useState(debt.name)
  const [limit, setLimit] = useState(asText(debt.credit_limit))
  const [rate, setRate] = useState(asText(debt.rate_ea))
  const [cutoff, setCutoff] = useState(asText(debt.cutoff_day))
  const [due, setDue] = useState(asText(debt.due_day))
  const [pocketId, setPocketId] = useState(debt.default_pocket_id ?? '')
  const [notes, setNotes] = useState(debt.notes ?? '')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const isCard = debt.kind === 'credit_card'
  const hasLimit = isCard || debt.kind === 'bnpl'
  const hasRate = debt.kind !== 'person'

  function save(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateDebt({
        id: debt.id,
        name,
        rateEa: toRate(rate),
        creditLimit: limit.trim() ? parseMoney(limit) : null,
        cutoffDay: isCard ? toDay(cutoff) : null,
        dueDay: isCard ? toDay(due) : null,
        defaultPocketId: pocketId || null,
        notes,
      })
      if (res.ok) {
        router.push('/deudas')
        router.refresh()
      } else setResult({ ok: false, message: res.error })
    })
  }

  function archive() {
    startTransition(async () => {
      const res = await setDebtActive(debt.id, false)
      if (res.ok) {
        router.push('/deudas')
        router.refresh()
      } else setResult({ ok: false, message: res.error })
    })
  }

  function remove() {
    if (!confirm(`¿Eliminar "${debt.name}"? Se borran su saldo y sus cuotas. Los pagos ya descontados de tus cajas se conservan.`)) return
    startTransition(async () => {
      const res = await deleteDebt(debt.id)
      if (res.ok) {
        router.push('/deudas')
        router.refresh()
      } else setResult({ ok: false, message: res.error })
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="space-y-4">
        <Field label="Nombre">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        {hasLimit && (
          <Field label={isCard ? 'Cupo total' : 'Cupo aprobado'}>
            <input inputMode="numeric" className={inputClass} value={limit} onChange={(e) => setLimit(e.target.value)} />
          </Field>
        )}
        {isCard && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Día de corte">
              <input inputMode="numeric" className={inputClass} value={cutoff} onChange={(e) => setCutoff(e.target.value)} />
            </Field>
            <Field label="Día límite de pago">
              <input inputMode="numeric" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
            </Field>
          </div>
        )}
        {hasRate && (
          <Field label="Tasa E.A. (%)">
            <input inputMode="decimal" className={inputClass} value={rate} onChange={(e) => setRate(e.target.value)} />
          </Field>
        )}
        <Field label="Caja desde la que se paga">
          <select className={inputClass} value={pocketId} onChange={(e) => setPocketId(e.target.value)}>
            <option value="">Sin definir</option>
            {pockets.map((p) => (
              <option key={p.pocket_id} value={p.pocket_id}>
                {p.emoji} {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nota">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Feedback result={result} />
        <SubmitButton pending={pending}>Guardar cambios</SubmitButton>
      </form>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <button onClick={archive} disabled={pending} className="rounded-xl border border-slate-300 px-3 py-3 disabled:opacity-50">
          Ocultar (ya está saldada)
        </button>
        <button onClick={remove} disabled={pending} className="rounded-xl border border-red-300 px-3 py-3 text-red-600 disabled:opacity-50">
          Eliminar
        </button>
      </div>
    </div>
  )
}

export function InstallmentsEditor({ debtId, installments }: { debtId: string; installments: Installment[] }) {
  const router = useRouter()
  const [count, setCount] = useState('')
  const [amountText, setAmountText] = useState('')
  const [firstDue, setFirstDue] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function add(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await addInstallments({
        debtId,
        count: parseInt(count, 10) || 0,
        amountEach: parseMoney(amountText),
        firstDue,
      })
      if (res.ok) {
        setCount('')
        setAmountText('')
        setResult({ ok: true, message: 'Cuotas programadas ✅' })
        router.refresh()
      } else setResult({ ok: false, message: res.error })
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteInstallment(id)
      router.refresh()
    })
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold">Cuotas programadas</h2>
      <p className="text-xs text-slate-500">
        Sirven para que la app te avise antes de cada pago. Se repiten cada mes en el mismo día.
      </p>

      {installments.length === 0 && <p className="text-sm text-slate-400">Aún no hay cuotas.</p>}
      <ul className="space-y-1.5 text-sm">
        {installments.map((i) => (
          <li key={i.id} className="flex items-center justify-between">
            <span>
              {shortDate(i.due_on)} · {cop2(i.amount)}
            </span>
            {i.paid_at ? (
              <span className="text-xs text-emerald-600">Pagada ✅</span>
            ) : (
              <button onClick={() => remove(i.id)} disabled={pending} className="text-xs text-slate-400 underline">
                Quitar
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="space-y-3 border-t border-slate-100 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número de cuotas">
            <input inputMode="numeric" className={inputClass} value={count} onChange={(e) => setCount(e.target.value)} placeholder="4" />
          </Field>
          <Field label="Valor de cada una">
            <input inputMode="decimal" className={inputClass} value={amountText} onChange={(e) => setAmountText(e.target.value)} placeholder={cop(50000)} />
          </Field>
        </div>
        <Field label="Fecha de la primera">
          <input type="date" className={inputClass} value={firstDue} onChange={(e) => setFirstDue(e.target.value)} />
        </Field>
        <Feedback result={result} />
        <SubmitButton pending={pending}>Programar cuotas</SubmitButton>
      </form>
    </section>
  )
}