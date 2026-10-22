import { redirect } from 'next/navigation'
import BottomNav from '@/components/bottom-nav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')

  return (
    <div className="relative mx-auto max-w-md px-4 pb-28 pt-5">
      <div className="pointer-events-none absolute -left-8 top-8 h-28 w-28 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 bottom-24 h-32 w-32 rounded-full bg-slate-200/10 blur-3xl" />
      <div className="glass-shell relative rounded-[32px] p-2">
        <div className="rounded-[26px] bg-slate-950/20 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}