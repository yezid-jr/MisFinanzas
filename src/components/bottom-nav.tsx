'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Home, Landmark, ReceiptText, TrendingUp } from 'lucide-react'

const items = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/ingreso', label: 'Ingreso', icon: TrendingUp },
  { href: '/gasto', label: 'Gasto', icon: ReceiptText },
  { href: '/deudas', label: 'Deudas', icon: Landmark },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200/80 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-center gap-2 px-3 py-2">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.22)]'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.1} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}