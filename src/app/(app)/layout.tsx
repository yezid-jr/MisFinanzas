import { redirect } from 'next/navigation'
import BottomNav from '@/components/bottom-nav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-5">
      <div className="glass-shell rounded-[30px] p-2">
        <div className="rounded-[24px] bg-white/10 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}