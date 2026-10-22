import { createClient } from '@/lib/supabase/server'
import { InstallPanel, NotificationsPanel } from '@/components/settings-panels'
import { ThemePanel } from '@/components/theme-panel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims as { email?: string } | undefined)?.email

  return (
    <main className="space-y-4">
      <header className="rounded-[24px] border border-[#282830] bg-[linear-gradient(135deg,rgba(26,26,30,0.96),rgba(18,18,22,0.96))] p-5 text-white shadow-[0_0_30px_rgba(217,119,36,0.12)]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a93]">Ajustes</p>
        <h1 className="mt-2 text-3xl font-bold">Configuración</h1>
      </header>

      <ThemePanel />
      <InstallPanel />
      <NotificationsPanel />

      <section className="space-y-3 rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="font-semibold text-white">💾 Respaldo de tus datos</h2>
        <p className="text-sm text-[#8a8a93]">
          Descárgalos cuando quieras. Te recomiendo hacerlo una vez al mes y guardarlo en tu Google Drive.
        </p>
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <a
            href="/api/export"
            className="rounded-xl px-3 py-3 font-medium text-white"
            style={{ background: 'var(--brand)' }}
          >
            Respaldo completo (JSON)
          </a>
          <a href="/api/export?formato=csv" className="rounded-xl border border-[#282830] bg-[#0d0d0e] px-3 py-3 text-white">
            Movimientos (Excel/CSV)
          </a>
        </div>
      </section>

      <section className="space-y-3 rounded-[24px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
        <h2 className="font-semibold text-white">👤 Cuenta</h2>
        {email && <p className="text-sm text-[#8a8a93]">{email}</p>}
        <form action="/auth/signout" method="post">
          <button className="w-full rounded-xl border border-[#282830] bg-[#0d0d0e] px-4 py-3 text-sm text-white">Cerrar sesión</button>
        </form>
      </section>
    </main>
  )
}
