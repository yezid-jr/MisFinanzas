import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { todayBogota } from '@/lib/format'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TABLES = [
  'settings',
  'accounts',
  'pockets',
  'categories',
  'movements',
  'debts',
  'debt_entries',
  'debt_installments',
  'recurring_charges',
] as const

type Supa = Awaited<ReturnType<typeof createClient>>

// PostgREST devuelve máximo 1000 filas por consulta: se pide por páginas
async function fetchAll(supabase: Supa, table: string, select = '*') {
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    const page = (data ?? []) as unknown as Record<string, unknown>[]
    rows.push(...page)
    if (page.length < 1000) break
  }
  return rows
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const format = new URL(request.url).searchParams.get('formato')
  const date = todayBogota()

  try {
    if (format === 'csv') {
      const rows = (await fetchAll(
        supabase,
        'movements',
        'occurred_on,kind,amount,income_source,note,pocket:pockets(name),category:categories(name)'
      )) as unknown as {
        occurred_on: string
        kind: string
        amount: number
        income_source: string | null
        note: string | null
        pocket: { name: string } | null
        category: { name: string } | null
      }[]

      rows.sort((a, b) => a.occurred_on.localeCompare(b.occurred_on))
      const header = ['fecha', 'tipo', 'caja', 'categoria', 'monto', 'fuente', 'nota']
      const lines = rows.map((r) =>
        [r.occurred_on, r.kind, r.pocket?.name, r.category?.name, r.amount, r.income_source, r.note]
          .map(csvCell)
          .join(',')
      )
      // BOM al inicio para que Excel lea bien las tildes
      const csv = '\uFEFF' + [header.join(','), ...lines].join('\r\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="movimientos-${date}.csv"`,
        },
      })
    }

    const backup: Record<string, unknown> = { exported_at: new Date().toISOString() }
    for (const t of TABLES) backup[t] = await fetchAll(supabase, t)
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="mis-finanzas-respaldo-${date}.json"`,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
