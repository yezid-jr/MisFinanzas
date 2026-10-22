import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-3 text-base text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_16px_32px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
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
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      {result.message}
    </p>
  )
}