export type Pocket = {
  id: string
  name: string
  emoji: string | null
  priority: number
  pct_work: number
  pct_tattoo: number
}

export type PocketBalance = {
  pocket_id: string
  name: string
  emoji: string | null
  priority: number
  goal: number | null
  earns_yield: boolean
  account_name: string
  balance: number
  goal_pct: number | null
}

export type PocketLite = {
  pocket_id: string
  name: string
  emoji: string | null
  balance: number
}

export type Category = {
  id: string
  name: string
  emoji: string | null
  default_pocket_id: string | null
}

export type MonthlySummary = {
  month: string
  income: number
  expenses: number
  debt_payments: number
  yield: number
}

export type IncomeSource = 'work' | 'tattoo' | 'other'

export type DebtKind = 'student_loan' | 'credit_card' | 'bnpl' | 'person' | 'other'

export type Debt = {
  id: string
  name: string
  kind: DebtKind
  rate_ea: number | null
  credit_limit: number | null
  cutoff_day: number | null
  due_day: number | null
  default_pocket_id: string | null
  is_active: boolean
  notes: string | null
}

export type DebtBalance = { debt_id: string; balance: number }

export type Installment = {
  id: string
  debt_id: string
  due_on: string
  amount: number
  paid_at: string | null
}

export type RecurringCharge = {
  id: string
  name: string
  category_id: string | null
  pocket_id: string
  amount: number
  day_of_month: number
  is_active: boolean
  last_posted_on: string | null
}

export type DebtEntryLite = { debt_id: string; kind: string; amount: number }