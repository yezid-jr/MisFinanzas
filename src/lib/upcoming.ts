import { addDays, daysBetween, nextOccurrence } from '@/lib/dates'
import type { Debt, DebtBalance, Installment, PocketLite, RecurringCharge } from '@/lib/types'

export type UpcomingItem = {
  key: string
  kind: 'recurring' | 'installment' | 'card'
  title: string
  due: string
  days: number
  amount: number
  pocketId: string | null
  pocketName: string | null
  pocketBalance: number | null
  short: number
  refId: string
}

type Args = {
  today: string
  startDate: string
  recurring: RecurringCharge[]
  installments: Installment[]
  debts: Debt[]
  balances: DebtBalance[]
  pockets: PocketLite[]
}

export function buildUpcoming(a: Args): UpcomingItem[] {
  const pocketById = new Map(a.pockets.map((p) => [p.pocket_id, p]))
  const debtById = new Map(a.debts.map((d) => [d.id, d]))
  const balanceByDebt = new Map(a.balances.map((b) => [b.debt_id, Number(b.balance)]))
  const items: UpcomingItem[] = []

  const push = (base: {
    key: string
    kind: 'recurring' | 'installment' | 'card'
    title: string
    due: string
    amount: number
    pocketId: string | null
    refId: string
  }) => {
    const pocket = base.pocketId ? pocketById.get(base.pocketId) : undefined
    const balance = pocket ? Number(pocket.balance) : null
    items.push({
      ...base,
      days: daysBetween(a.today, base.due),
      pocketName: pocket?.name ?? null,
      pocketBalance: balance,
      short: balance === null ? 0 : Math.max(0, base.amount - balance),
    })
  }

  for (const r of a.recurring) {
    if (!r.is_active) continue
    const cursor = r.last_posted_on ?? addDays(a.startDate, -1)
    push({
      key: `r-${r.id}`,
      kind: 'recurring',
      title: r.name,
      due: nextOccurrence(r.day_of_month, cursor),
      amount: Number(r.amount),
      pocketId: r.pocket_id,
      refId: r.id,
    })
  }

  for (const i of a.installments) {
    if (i.paid_at) continue
    const debt = debtById.get(i.debt_id)
    push({
      key: `i-${i.id}`,
      kind: 'installment',
      title: `${debt?.name ?? 'Deuda'} · cuota`,
      due: i.due_on,
      amount: Number(i.amount),
      pocketId: debt?.default_pocket_id ?? null,
      refId: i.id,
    })
  }

  for (const d of a.debts) {
    const balance = balanceByDebt.get(d.id) ?? 0
    if (d.kind !== 'credit_card' || !d.due_day || balance <= 0) continue
    push({
      key: `card-${d.id}`,
      kind: 'card',
      title: `${d.name} · pago tarjeta`,
      due: `${a.today.slice(0, 7)}-${String(d.due_day).padStart(2, '0')}`,
      amount: balance,
      pocketId: d.default_pocket_id ?? null,
      refId: d.id,
    })
  }

  return items.sort((x, y) => x.due.localeCompare(y.due))
}

export function fundingByPocket(items: UpcomingItem[], horizonDays: number) {
  const map = new Map<string, { name: string; needed: number; balance: number }>()

  for (const it of items) {
    if (!it.pocketId || it.days > horizonDays) continue
    const row = map.get(it.pocketId) ?? { name: it.pocketName ?? '', needed: 0, balance: it.pocketBalance ?? 0 }
    row.needed += it.amount
    map.set(it.pocketId, row)
  }

  return [...map.values()]
    .map((r) => ({ ...r, short: Math.max(0, r.needed - r.balance) }))
    .filter((r) => r.short > 0)
}
