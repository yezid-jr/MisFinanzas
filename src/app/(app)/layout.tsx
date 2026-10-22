import { redirect } from 'next/navigation'
import BottomNav from '@/components/bottom-nav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')

  return (
    <div className="relative mx-auto max-w-md px-4 pb-28 pt-5">
      <div className="pointer-events-none absolute -left-6 top-10 h-28 w-28 rounded-full bg-[#d97724]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 bottom-20 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      <div className="glass-shell relative rounded-[32px] border border-[#1f1f24] bg-[#0d0d0e] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="rounded-[26px] bg-[#0d0d0e] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}