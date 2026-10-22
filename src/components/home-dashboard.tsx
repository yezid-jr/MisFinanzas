'use client'

import Link from 'next/link'
import { ArrowRightLeft, Eye, EyeOff, Settings, Target, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { cop, pct } from '@/lib/format'
import type { PocketBalance } from '@/lib/types'
import type { UpcomingItem } from '@/lib/upcoming'
import UpcomingList from '@/components/upcoming-list'

const LINKS = [
  { href: '/transferir', label: 'Mover plata', icon: ArrowRightLeft },
  { href: '/cobros', label: 'Cobros', icon: TrendingUp },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/historial', label: 'Historial', icon: Wallet },
  { href: '/conciliar', label: 'Conciliar', icon: Wallet },
]

export function HomeDashboard({
  total,
  income,
  expenses,
  yieldAmount,
  estimatedMonthlyYield,
  yieldEa,
  userName,
  totalDebt,
  pockets,
  upcomingItems,
}: {
  total: number
  income?: number
  expenses?: number
  yieldAmount?: number
  estimatedMonthlyYield: number
  yieldEa: number
  userName: string
  totalDebt: number
  pockets: PocketBalance[]
  upcomingItems: UpcomingItem[]
}) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)

  const displayTotal = isBalanceHidden ? '••••••••' : cop(total)
  const displayUser = userName || 'Usuario'
  const soon = upcomingItems.filter((item) => item.days <= 30).slice(0, 3)

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d97724]/40 bg-[#d97724]/15 text-sm font-bold text-[#e08a3e]">
            {displayUser.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a8a93]">Bienvenido</p>
            <p className="text-sm font-bold text-white">{displayUser}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ajustes"
            aria-label="Ajustes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#282830] bg-[#161619] text-[#8a8a93] transition hover:text-white"
          >
            <Settings className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          <form action="/auth/signout" method="post">
            <button className="rounded-full border border-[#282830] bg-[#161619] px-3 py-1.5 text-xs font-medium text-[#8a8a93] transition hover:text-white">
              Salir
            </button>
          </form>
        </div>
      </div>

      <header className="relative overflow-hidden rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.95),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#d97724]/15 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Total en tus cajas</span>
          <button
            type="button"
            onClick={() => setIsBalanceHidden((v) => !v)}
            className="rounded-full border border-[#282830] bg-[#161619] p-1.5 text-[#8a8a93] transition hover:text-white"
            aria-label={isBalanceHidden ? 'Mostrar saldo' : 'Ocultar saldo'}
          >
            {isBalanceHidden ? <EyeOff className="h-3.5 w-3.5" strokeWidth={2.1} /> : <Eye className="h-3.5 w-3.5" strokeWidth={2.1} />}
          </button>
        </div>

        <div className="relative mt-3 flex items-baseline gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{displayTotal}</h1>
          <span className="text-[11px] font-medium text-[#22C55E]">+4.2%</span>
        </div>

        <div className="relative mt-4 rounded-xl border border-[#343440] bg-[#0d0d0e]/70 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d97724]/12 text-[#e08a3e]">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.3} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a8a93]">Rendimiento Estimado</p>
              <p className="mt-0.5 text-xs font-medium text-white">
                Con <span className="font-bold text-[#e08a3e]">{pct(yieldEa, 2)} E.A.</span> rinden{' '}
                <span className="font-bold text-[#e08a3e]">≈ {cop(estimatedMonthlyYield)}</span> / mes
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Ingresos" value={income ?? 0} tone="text-[#22C55E]" />
        <Stat label="Gastos" value={expenses ?? 0} tone="text-[#EF4444]" />
        <Stat label="Rend." value={yieldAmount ?? 0} tone="text-[#e08a3e]" />
      </section>

      <section className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Accesos rápidos</h2>
          <span className="text-[10px] font-medium text-[#e08a3e]">Personalizar</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {LINKS.map((l) => {
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 rounded-xl border border-[#282830] bg-[#0d0d0e] p-2.5 text-left text-xs font-medium text-white transition hover:border-[#d97724]/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#282830] bg-[#161619] text-[#e08a3e]">
                  <Icon className="h-4 w-4" strokeWidth={2.1} />
                </span>
                {l.label}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Próximos Cobros</h2>
          <Link href="/cobros" className="text-[10px] font-medium text-[#e08a3e]">Ver todos</Link>
        </div>
        <div className="mt-3 space-y-2">
          {soon.length === 0 ? (
            <p className="text-sm text-slate-500">Sin cobros próximos.</p>
          ) : (
            <UpcomingList items={soon} compact />
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Deuda total</p>
            <p className="mt-1 text-2xl font-bold text-white">{cop(totalDebt)}</p>
          </div>
          <Link href="/deudas" className="text-sm font-medium text-[#e08a3e]">Ver detalle →</Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Mis cajas</h2>
          <span className="rounded-full bg-[#0d0d0e] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e08a3e]">
            {pockets.length}
          </span>
        </div>

        {pockets.length === 0 && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Aún no hay cajas.
          </p>
        )}

        {pockets.map((pocket) => (
          <div key={pocket.pocket_id} className="rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-white">{pocket.emoji ?? '💰'} {pocket.name}</p>
                <p className="mt-1 text-xs text-[#8a8a93]">{pocket.account_name}</p>
              </div>
              <p className="text-lg font-bold text-white">{cop(pocket.balance)}</p>
            </div>

            {pocket.goal && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Meta</span>
                  <span>{pocket.goal_pct ?? 0}% de {cop(pocket.goal)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#10b981_100%)]"
                    style={{ width: `${Math.min(100, Math.max(0, Number(pocket.goal_pct ?? 0)))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-[18px] border border-[#282830] bg-[#161619] p-3 shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
      <p className={`text-lg font-bold ${tone}`}>{cop(value)}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a8a93]">{label}</p>
    </div>
  )
}
