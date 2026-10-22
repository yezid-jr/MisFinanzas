import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildUpcoming } from '@/lib/upcoming'
import { buildDigest } from '@/lib/alerts'
import { sendPush } from '@/lib/push'
import { todayBogota } from '@/lib/format'
import type { Debt, DebtBalance, Installment, PocketLite, RecurringCharge } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Vercel llama a esta ruta cada día (ver vercel.json) con: Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Faltan variables de Supabase' }, { status: 500 })
  }

  // Cliente con la llave de servicio: se salta la seguridad por filas. Solo vive en el servidor.
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const today = todayBogota()

  const [rc, inst, debts, bal, pockets, settings, subs] = await Promise.all([
    db.from('recurring_charges').select('*').eq('is_active', true),
    db.from('debt_installments').select('*').is('paid_at', null),
    db.from('debts').select('*').eq('is_active', true),
    db.from('debt_balances').select('debt_id,balance'),
    db.from('pocket_balances').select('pocket_id,name,emoji,balance'),
    db.from('settings').select('start_date').limit(1).maybeSingle(),
    db.from('push_subscriptions').select('endpoint,p256dh,auth'),
  ])

  const items = buildUpcoming({
    today,
    startDate: (settings.data?.start_date as string | undefined) ?? today,
    recurring: (rc.data ?? []) as RecurringCharge[],
    installments: (inst.data ?? []) as Installment[],
    debts: (debts.data ?? []) as Debt[],
    balances: (bal.data ?? []) as DebtBalance[],
    pockets: (pockets.data ?? []) as PocketLite[],
  })

  const digest = buildDigest(items)
  if (!digest) return NextResponse.json({ sent: 0, reason: 'Nada que avisar hoy' })

  let sent = 0
  let removed = 0
  for (const s of subs.data ?? []) {
    const status = await sendPush(s, digest)
    if (status === 'ok') sent++
    if (status === 'gone') {
      await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      removed++
    }
  }
  return NextResponse.json({ sent, removed, items: items.filter((i) => i.days <= 3).length })
}
