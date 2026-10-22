'use client'

import { createClient } from '@/lib/supabase/client'

export default function GoogleButton() {
  const signIn = () =>
    createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })

  return (
    <button
      onClick={signIn}
      className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white active:scale-[0.98]"
    >
      Entrar con Google
    </button>
  )
}