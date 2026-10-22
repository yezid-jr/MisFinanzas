import { createClient } from '@/lib/supabase/server'
import { addDays, daysBetween } from '@/lib/dates'
import { cop, todayBogota } from '@/lib/format'
import type { PocketBalance } from '@/lib/types'

export default async function GoalsPage() {
  const supabase = await createClient()
  const today = todayBogota()
  const since = addDays(today, -90)

  const [pocketsRes, netRes, firstRes] = await Promise.all([
    supabase.from('pocket_balances').select('*').not('goal', 'is', null).order('priority'),
    supabase.rpc('pocket_net_since', { p_since: since }),
    supabase.from('movements').select('occurred_on').neq('kind', 'opening').order('occurred_on').limit(1),
  ])

  const pockets = (pocketsRes.data ?? []) as PocketBalance[]
  const netByPocket = new Map(((netRes.data ?? []) as { pocket_id: string; net: number }[]).map((r) => [r.pocket_id, Number(r.net)]))
  const firstDate = (firstRes.data?.[0]?.occurred_on as string | undefined) ?? today
  const windowStart = firstDate > since ? firstDate : since
  const windowDays = daysBetween(windowStart, today) + 1
  const enoughData = windowDays >= 14

  return (
    <main className="space-y-5">
      <header className="rounded-[28px] bg-[linear-gradient(135deg,#052e16_0%,#166534_100%)] p-5 text-white shadow-[0_24px_44px_rgba(22,101,52,0.24)]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/80">Metas</p>
        <h1 className="mt-2 text-3xl font-bold">Tus objetivos</h1>
        <p className="mt-1 text-sm text-emerald-100/80">
          La proyección usa tu ritmo real de ahorro de los últimos {Math.min(windowDays, 90)} días.
        </p>
      </header>

      {pockets.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Ninguna caja tiene meta definida.</p>
      ) : (
        <div className="space-y-3">
          {pockets.map((p) => {
            const goal = Number(p.goal)
            const balance = Number(p.balance)
            const remaining = Math.max(0, goal - balance)
            const perMonth = ((netByPocket.get(p.pocket_id) ?? 0) / windowDays) * 30
            const progress = Math.min(100, Math.max(0, (balance / goal) * 100))

            let projection: string
            if (remaining === 0) projection = '🎉 ¡Meta alcanzada!'
            else if (!enoughData) projection = 'Necesito 2 semanas de movimientos para proyectar.'
            else if (perMonth <= 0) projection = 'Tu ahorro actual no está creciendo aún.'
            else projection = `Con tu ritmo actual, te faltan ${Math.ceil(remaining / perMonth)} meses aprox.`

            return (
              <div key={p.pocket_id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-800">{p.emoji ?? '💰'} {p.name}</p>
                    <p className="text-xs text-slate-500">{cop(balance)} disponible</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#10b981_0%,#34d399_100%)]" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Meta</div>
                    <div className="mt-1 font-semibold text-slate-800">{cop(goal)}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Falta</div>
                    <div className="mt-1 font-semibold text-slate-800">{cop(remaining)}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
                  {projection}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
