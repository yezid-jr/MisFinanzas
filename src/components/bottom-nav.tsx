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
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#282830] bg-[#0d0d0e]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-center gap-2 px-3 py-2">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-all"
                style={
                  active
                    ? {
                        borderColor: 'rgba(var(--brand-rgb), 0.3)',
                        background: '#1e1e23',
                        color: 'var(--brand-strong)',
                        boxShadow: '0 8px 20px rgba(var(--brand-rgb), 0.12)',
                      }
                    : undefined
                }
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