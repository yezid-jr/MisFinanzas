import type { Metadata, Viewport } from 'next'
import './globals.css'
import SwRegister from '@/components/sw-register'

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
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        <SwRegister />
      </body>
    </html>
  )
}