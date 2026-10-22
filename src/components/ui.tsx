import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-2xl border border-[#282830] bg-[#0d0d0e] px-3.5 py-3 text-base text-white outline-none transition-all duration-200 placeholder:text-[#8a8a93] focus:border-[rgba(var(--brand-rgb),0.6)] focus:ring-4 focus:ring-[rgba(var(--brand-rgb),0.1)]'

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
      className="w-full rounded-2xl px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)',
        boxShadow: '0 16px 32px rgba(var(--brand-rgb), 0.22)',
      }}
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