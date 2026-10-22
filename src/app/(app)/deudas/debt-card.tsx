'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { addDebtEntry, payDebt, syncDebtBalance } from '@/lib/actions'
import { cop, cop2, parseMoney, pct, todayBogota } from '@/lib/format'
import { addDays, daysBetween, nextOccurrence, relativeLabel, shortDate } from '@/lib/dates'
import { monthlyRate } from '@/lib/finance'
import type { Debt, DebtEntryLite, DebtKind, Installment, PocketLite } from '@/lib/types'
import { Feedback, Field, SubmitButton, inputClass } from '@/components/ui'

const KIND_META: Record<DebtKind, { icon: string; label: string }> = {
  credit_card: { icon: '💳', label: 'Tarjeta de crédito' },
  bnpl: { icon: '🛍️', label: 'Compra a cuotas' },
  person: { icon: '🤝', label: 'Deuda personal' },
  student_loan: { icon: '🎓', label: 'Préstamo / crédito educativo' },
  other: { icon: '📄', label: 'Otra deuda' },
}

const ACTIONS: Record<DebtKind, [string, string, string]> = {
  credit_card: ['Pagar', 'Compra o cargo', 'Saldo real'],
  bnpl: ['Pagar cuota', 'Cargo extra', 'Saldo real'],
  person: ['Abonar', 'Me prestó más', 'Saldo real'],
  student_loan: ['Pagar', 'Interés o cargo', 'Saldo real'],
  other: ['Pagar', 'Cargo', 'Saldo real'],
}

type Mode = 'pay' | 'charge' | 'sync' | null

export default function DebtCard({
  debt,
  pockets,
  installments,
  entries,
  yieldEa,
  today,
}: {
  debt: Debt & { balance: number }
  pockets: PocketLite[]
  installments: Installment[]
  entries: DebtEntryLite[]
  yieldEa: number
  today: string
}) {
  const unpaid = installments.filter((i) => !i.paid_at).sort((a, b) => a.due_on.localeCompare(b.due_on))
  const next = unpaid[0] ?? null
  const paidCount = installments.length - unpaid.length

  const [mode, setMode] = useState<Mode>(null)
  const [amountText, setAmountText] = useState(next ? String(Math.round(Number(next.amount))) : '')
  const [pocketId, setPocketId] = useState(debt.default_pocket_id ?? '')
  const [useInstallment, setUseInstallment] = useState(!!next)
  const [chargeKind, setChargeKind] = useState<'charge' | 'interest' | 'fee'>('charge')
  const [date, setDate] = useState(todayBogota())
  const [note, setNote] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const meta = KIND_META[debt.kind]
  const [payLabel, chargeLabel, syncLabel] = ACTIONS[debt.kind]
  const rate = debt.rate_ea ? Number(debt.rate_ea) : null
  const limit = debt.credit_limit ? Number(debt.credit_limit) : null
  const monthlyInterest = rate ? debt.balance * monthlyRate(rate) : 0
  const isPaidOff = debt.balance <= 0.005
  const amount = parseMoney(amountText)
  const pocket = pockets.find((p) => p.pocket_id === pocketId)

  // Desglose (compra a cuotas): capital, intereses, fianza y lo ya pagado
  const sum = (kinds: string[]) => entries.filter((e) => kinds.includes(e.kind)).reduce((s, e) => s + Number(e.amount), 0)
  const capital = sum(['opening', 'charge'])
  const interest = sum(['interest'])
  const fees = sum(['fee'])
  const paidSoFar = -sum(['payment'])

  // Tarjeta: próximas fechas
  const yesterday = addDays(today, -1)
  const nextCut = debt.cutoff_day ? nextOccurrence(debt.cutoff_day, yesterday) : null
  const nextDue = debt.due_day ? nextOccurrence(debt.due_day, yesterday) : null
  const usage = debt.kind === 'credit_card' && limit ? (debt.balance / limit) * 100 : null

  function open(m: Mode) {
    setResult(null)
    setMode(mode === m ? null : m)
    if (m === 'sync') setAmountText(debt.balance.toFixed(2).replace('.', ','))
    if (m === 'pay') setAmountText(next ? String(Math.round(Number(next.amount))) : '')
    if (m === 'charge') setAmountText('')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      let res
      if (mode === 'pay') {
        res = await payDebt({
          debtId: debt.id,
          pocketId,
          amount,
          date,
          installmentId: useInstallment && next ? next.id : null,
          note,
        })
      } else if (mode === 'charge') {
        res = await addDebtEntry({ debtId: debt.id, kind: debt.kind === 'person' ? 'charge' : chargeKind, amount, date, note })
      } else {
        res = await syncDebtBalance({ debtId: debt.id, realBalance: amount, date })
      }
      if (res.ok) {
        setResult({ ok: true, message: 'Listo ✅' })
        setMode(null)
        setNote('')
      } else {
        setResult({ ok: false, message: res.error })
      }
    })
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{
              borderColor: 'rgba(var(--brand-rgb), 0.35)',
              background: 'rgba(var(--brand-rgb), 0.1)',
              color: 'var(--brand-strong)',
            }}
          >
            <span>{meta.icon}</span>
            {meta.label}
          </div>
          <p className="truncate font-semibold text-white">{debt.name}</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${isPaidOff ? 'text-emerald-400' : 'text-rose-400'}`}>{cop2(debt.balance)}</p>
          {isPaidOff && <p className="text-xs text-emerald-400">Saldada ✅</p>}
        </div>
      </div>

      {/* ---------- TARJETA DE CRÉDITO ---------- */}
      {debt.kind === 'credit_card' && (
        <>
          {usage !== null && limit && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-[#0d0d0e]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, usage)}%`, background: usage > 70 ? '#f87171' : 'var(--brand-strong)' }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-[#8a8a93]">
                <span>Usas {pct(usage, 0)} de {cop(limit)}</span>
                <span>Disponible {cop(Math.max(0, limit - debt.balance))}</span>
              </div>
            </div>
          )}
          {(nextCut || nextDue) && (
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {nextCut && (
                <div className="rounded-xl border border-[#282830] bg-[#0d0d0e] p-2">
                  <p className="font-semibold text-white">{shortDate(nextCut)}</p>
                  <p className="text-[#8a8a93]">Corte · {relativeLabel(daysBetween(today, nextCut)).toLowerCase()}</p>
                </div>
              )}
              {nextDue && (
                <div className="rounded-xl border border-[#282830] bg-[#0d0d0e] p-2">
                  <p className="font-semibold text-white">{shortDate(nextDue)}</p>
                  <p className="text-[#8a8a93]">Pagar antes · {relativeLabel(daysBetween(today, nextDue)).toLowerCase()}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ---------- COMPRA A CUOTAS (Addi) ---------- */}
      {debt.kind === 'bnpl' && (
        <>
          {installments.length > 0 && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-[#0d0d0e]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(paidCount / installments.length) * 100}%`, background: 'var(--brand-strong)' }}
                />
              </div>
              <p className="mt-1 text-xs text-[#8a8a93]">
                {paidCount} de {installments.length} cuotas pagadas
              </p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-[#282830] bg-[#0d0d0e] p-2">
              <p className="font-semibold text-white">{cop(capital)}</p>
              <p className="text-[#8a8a93]">Capital</p>
            </div>
            <div className="rounded-xl border border-[#282830] bg-[#0d0d0e] p-2">
              <p className="font-semibold text-white">{cop(interest)}</p>
              <p className="text-[#8a8a93]">Intereses</p>
            </div>
            <div className="rounded-xl border border-[#282830] bg-[#0d0d0e] p-2">
              <p className="font-semibold text-white">{cop(fees)}</p>
              <p className="text-[#8a8a93]">Fianza y costos</p>
            </div>
          </div>
          <p className="text-xs text-[#8a8a93]">
            {limit ? `Cupo aprobado ${cop(limit)} · ` : ''}Pagado hasta hoy {cop(paidSoFar)}
          </p>
        </>
      )}

      {/* ---------- TASA (si tiene) ---------- */}
      {rate !== null && debt.kind !== 'bnpl' && !isPaidOff && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#282830] bg-[#0d0d0e] px-2 py-1 text-[#d9d9df]">{pct(rate, 2)} E.A.</span>
          <span className="rounded-full border border-[#282830] bg-[#0d0d0e] px-2 py-1 text-[#d9d9df]">≈ {cop(monthlyInterest)} de interés al mes</span>
          <span
            className="rounded-full px-2 py-1"
            style={{
              background: rate > yieldEa ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              color: rate > yieldEa ? '#fca5a5' : '#86efac',
            }}
          >
            {rate > yieldEa ? 'Cuesta más' : 'Cuesta menos'} que el {pct(yieldEa, 2)} que rinden tus cajas
          </span>
        </div>
      )}

      {/* ---------- CUOTAS PENDIENTES ---------- */}
      {unpaid.length > 0 && (
        <div className="rounded-xl border border-[#282830] bg-[#0d0d0e] p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a8a93]">
            {debt.kind === 'person' ? 'Fecha pactada' : 'Cuotas pendientes'}
          </p>
          <ul className="space-y-1">
            {unpaid.map((i) => (
              <li key={i.id} className="flex justify-between gap-2 text-white">
                <span>
                  {shortDate(i.due_on)}{' '}
                  <span className="text-xs text-[#8a8a93]">({relativeLabel(daysBetween(today, i.due_on)).toLowerCase()})</span>
                </span>
                <span className="font-medium">{cop2(i.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {debt.notes && <p className="text-xs text-[#8a8a93]">{debt.notes}</p>}

      {/* ---------- ACCIONES ---------- */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        {(
          [
            ['pay', payLabel],
            ['charge', chargeLabel],
            ['sync', syncLabel],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => open(m)}
            className="rounded-xl border px-1 py-2 text-xs leading-tight"
            style={
              mode === m
                ? {
                    borderColor: 'rgba(var(--brand-rgb), 0.45)',
                    background: 'rgba(var(--brand-rgb), 0.12)',
                    color: 'var(--brand-strong)',
                  }
                : {
                    borderColor: '#282830',
                    background: '#0d0d0e',
                    color: '#d9d9df',
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {mode && (
        <form onSubmit={onSubmit} className="space-y-3 border-t border-[#282830] pt-3">
          {mode === 'charge' && debt.kind !== 'person' && (
            <Field label="Tipo de cargo">
              <select
                className={inputClass}
                value={chargeKind}
                onChange={(e) => setChargeKind(e.target.value as 'charge' | 'interest' | 'fee')}
              >
                <option value="charge">{debt.kind === 'credit_card' ? 'Compra' : 'Cargo'}</option>
                <option value="interest">Interés (incluye mora)</option>
                <option value="fee">Cuota de manejo / comisión</option>
              </select>
            </Field>
          )}

          <Field label={mode === 'sync' ? 'Saldo real según la plataforma' : 'Monto'}>
            <input
              inputMode="decimal"
              className={inputClass}
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              placeholder="0"
            />
          </Field>

          {mode === 'pay' && (
            <>
              <Field label="¿De qué caja sale el pago?">
                <select className={inputClass} value={pocketId} onChange={(e) => setPocketId(e.target.value)} required>
                  <option value="">Elige una caja…</option>
                  {pockets.map((p) => (
                    <option key={p.pocket_id} value={p.pocket_id}>
                      {p.emoji} {p.name} · {cop(p.balance)}
                    </option>
                  ))}
                </select>
              </Field>
              {pocket && amount > Number(pocket.balance) && (
                <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-2 text-xs text-amber-200">
                  {pocket.name} solo tiene {cop(pocket.balance)}. Mueve plata primero desde otra caja.
                </p>
              )}
              {next && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={useInstallment} onChange={(e) => setUseInstallment(e.target.checked)} />
                  Este pago es la cuota del {shortDate(next.due_on)}
                </label>
              )}
            </>
          )}

          {mode === 'sync' && (
            <p className="text-xs text-[#8a8a93]">
              Diferencia con la app: {cop2(amount - debt.balance)}. Se registra como ajuste.
            </p>
          )}

          <Field label="Fecha">
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          {mode !== 'sync' && (
            <Field label="Nota (opcional)">
              <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          )}

          <Feedback result={result} />
          <SubmitButton pending={pending}>
            {mode === 'pay' ? 'Registrar pago' : mode === 'charge' ? 'Registrar' : 'Actualizar saldo'}
          </SubmitButton>
        </form>
      )}

      {!mode && <Feedback result={result} />}

      <div className="text-right">
        <Link href={`/deudas/${debt.id}/editar`} className="text-xs underline" style={{ color: 'var(--brand-strong)' }}>
          Editar datos
        </Link>
      </div>
    </div>
  )
}