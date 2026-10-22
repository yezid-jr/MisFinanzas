import { createClient } from '@/lib/supabase/server'
import { InstallPanel, NotificationsPanel } from '@/components/settings-panels'
import { ThemePanel } from '@/components/theme-panel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims as { email?: string } | undefined)?.email

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <ThemePanel />
      <InstallPanel />
      <NotificationsPanel />

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">💾 Respaldo de tus datos</h2>
        <p className="text-sm text-slate-500">
          Descárgalos cuando quieras. Te recomiendo hacerlo una vez al mes y guardarlo en tu Google Drive.
        </p>
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <a href="/api/export" className="rounded-xl bg-slate-900 px-3 py-3 font-medium text-white">
            Respaldo completo (JSON)
          </a>
          <a href="/api/export?formato=csv" className="rounded-xl border border-slate-300 px-3 py-3">
            Movimientos (Excel/CSV)
          </a>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">👤 Cuenta</h2>
        {email && <p className="text-sm text-slate-500">{email}</p>}
        <form action="/auth/signout" method="post">
          <button className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm">Cerrar sesión</button>
        </form>
      </section>
    </main>
  )
}
