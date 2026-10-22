'use client'

import Link from 'next/link'
import { ArrowRightLeft, Eye, EyeOff, Settings, Target, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cop, pct } from '@/lib/format'

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
}: {
  total: number
  income?: number
  expenses?: number
  yieldAmount?: number
  estimatedMonthlyYield: number
  yieldEa: number
  userName: string
}) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)

  const chartPoints = useMemo(() => {
    const values = [18, 34, 29, 52, 44, 71, 63, 83, 78, 96, 110, 127]
    const max = Math.max(...values)
    const min = Math.min(...values)

    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 100
        const y = 100 - ((value - min) / (max - min || 1)) * 80 - 10
        return `${x},${y}`
      })
      .join(' ')
  }, [])

  const displayTotal = isBalanceHidden ? '••••••••' : cop(total)
  const displayUser = userName || 'Usuario'

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Rendimiento Anual</h2>
            <p className="mt-1 text-base font-bold text-white">{cop(estimatedMonthlyYield)} <span className="text-[10px] font-normal text-[#8a8a93]">/ promedio mes</span></p>
          </div>
          <div className="rounded-lg border border-[#282830] bg-[#0d0d0e] px-2 py-1 text-[10px] font-medium text-[#e08a3e]">1A</div>
        </div>

        <div className="mt-4 h-32 w-full overflow-hidden rounded-2xl border border-[#282830] bg-[#0d0d0e] p-2">
          <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none" aria-label="Gráfico de rendimiento">
            <defs>
              <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(224,138,62,0.45)" />
                <stop offset="100%" stopColor="rgba(224,138,62,0)" />
              </linearGradient>
            </defs>
            <path d={`M 0 34 L ${chartPoints} L 100 34 Z`} fill="url(#chartGlow)" opacity="0.75" />
            <polyline
              fill="none"
              stroke="#E08A3E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartPoints}
            />
          </svg>
        </div>
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
