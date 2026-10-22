import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-2xl border border-[#282830] bg-[#0d0d0e] px-3.5 py-3 text-base text-white outline-none transition-all duration-200 placeholder:text-[#8a8a93] focus:border-[#d97724]/60 focus:ring-4 focus:ring-[#d97724]/10'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#8a8a93]">{label}</span>
      {children}
    </label>
  )
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-[linear-gradient(135deg,#d97724_0%,#e08a3e_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_16px_32px_rgba(217,119,36,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(217,119,36,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Guardando…' : children}
    </button>
  )
}

export function Feedback({ result }: { result: { ok: boolean; message: string } | null }) {
  if (!result) return null
  return (
    <p
      className={`rounded-2xl border p-3 text-sm ${
        result.ok
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
      }`}
    >
      {result.message}
    </p>
  )
}