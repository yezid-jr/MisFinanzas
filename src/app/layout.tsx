import type { Metadata, Viewport } from 'next'
import './globals.css'
import SwRegister from '@/components/sw-register'
import ThemeInit from '@/components/theme-init'

export const metadata: Metadata = {
  title: 'Mis Finanzas',
  description: 'Mis cajas, ingresos, gastos y deudas',
  applicationName: 'Mis Finanzas',
  appleWebApp: { capable: true, title: 'Finanzas', statusBarStyle: 'default' },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased" style={{ background: 'var(--bg-1)', color: 'var(--text)' }}>
        <ThemeInit />
        {children}
        <SwRegister />
      </body>
    </html>
  )
}