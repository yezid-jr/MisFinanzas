import { addMonthsKeepDay } from '@/lib/dates'

export const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Reparte un total en cuotas mensuales iguales. La última cuota absorbe los centavos
 * para que la suma sea exacta. Ej: 753.783,16 en 3 -> 251.261,05 + 251.261,05 + 251.261,06
 */
export function splitInstallments(total: number, count: number, firstDue: string) {
  const base = Math.floor((total / count) * 100) / 100
  const rows: { due_on: string; amount: number }[] = []
  let acc = 0
  for (let k = 0; k < count; k++) {
    const amount = k === count - 1 ? round2(total - acc) : base
    acc = round2(acc + amount)
    rows.push({ due_on: addMonthsKeepDay(firstDue, k), amount })
  }
  return rows
}