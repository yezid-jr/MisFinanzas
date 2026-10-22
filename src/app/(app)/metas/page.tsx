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
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Metas</p>
        <h1 className="mt-2 text-3xl font-bold">Tus objetivos</h1>
        <p className="mt-1 text-sm text-[#8a8a93]">
          La proyección usa tu ritmo real de ahorro de los últimos {Math.min(windowDays, 90)} días.
        </p>
      </header>

      {pockets.length === 0 ? (
        <p className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 text-sm text-[#8a8a93]">Ninguna caja tiene meta definida.</p>
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
              <div key={p.pocket_id} className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">{p.emoji ?? '💰'} {p.name}</p>
                    <p className="text-xs text-[#8a8a93]">{cop(balance)} disponible</p>
                  </div>
                  <span className="rounded-full bg-[#d97724]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e08a3e]">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#0d0d0e]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#d97724_0%,#f7c07a_100%)]" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-[#0d0d0e] p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[#8a8a93]">Meta</div>
                    <div className="mt-1 font-semibold text-white">{cop(goal)}</div>
                  </div>
                  <div className="rounded-2xl bg-[#0d0d0e] p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[#8a8a93]">Falta</div>
                    <div className="mt-1 font-semibold text-white">{cop(remaining)}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#d97724]/20 bg-[#d97724]/10 p-3 text-sm text-[#f7c07a]">
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
