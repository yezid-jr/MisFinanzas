'use client'

import { ArrowLeft, Check, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type Swatch = {
  id: string
  name: string
  value: string
}

const SWATCHES: Swatch[] = [
  { id: 'lavanda', name: 'Lavanda', value: '#c4b5fd' },
  { id: 'mint', name: 'Menta', value: '#a7f3d0' },
  { id: 'sky', name: 'Cielo', value: '#bae6fd' },
  { id: 'peach', name: 'Durazno', value: '#fed7aa' },
  { id: 'rose', name: 'Rosa', value: '#fecdd3' },
]

function adjustHex(hex: string, amount: number) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const value = Number.parseInt(full, 16)
  const r = Math.max(0, Math.min(255, (value >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (value & 255) + amount))
  return `rgb(${r}, ${g}, ${b})`
}

function applyTheme(theme: ThemeMode, accent: string) {
  const root = document.documentElement
  const safeAccent = accent || SWATCHES[0].value

  if (theme === 'dark') {
    root.dataset.theme = 'dark'
    root.style.setProperty('--bg-1', '#020817')
    root.style.setProperty('--bg-2', '#0f172a')
    root.style.setProperty('--panel', 'rgba(15, 23, 42, 0.82)')
    root.style.setProperty('--panel-strong', 'rgba(15, 23, 42, 0.95)')
    root.style.setProperty('--line', 'rgba(148, 163, 184, 0.15)')
    root.style.setProperty('--text', '#e2e8f0')
    root.style.setProperty('--text-soft', '#cbd5e1')
    root.style.setProperty('--surface', '#111827')
    root.style.setProperty('--surface-strong', '#1f2937')
  } else {
    root.dataset.theme = 'light'
    root.style.setProperty('--bg-1', '#f8fbff')
    root.style.setProperty('--bg-2', '#eef6ff')
    root.style.setProperty('--panel', 'rgba(255,255,255,0.8)')
    root.style.setProperty('--panel-strong', 'rgba(255,255,255,0.94)')
    root.style.setProperty('--line', 'rgba(148,163,184,0.18)')
    root.style.setProperty('--text', '#0f172a')
    root.style.setProperty('--text-soft', '#475569')
    root.style.setProperty('--surface', '#ffffff')
    root.style.setProperty('--surface-strong', '#f8fafc')
  }

  root.style.setProperty('--brand', safeAccent)
  root.style.setProperty('--brand-soft', adjustHex(safeAccent, 80))
  root.style.setProperty('--brand-strong', adjustHex(safeAccent, -35))
  root.style.setProperty('--hero-start', adjustHex(safeAccent, 15))
  root.style.setProperty('--hero-end', '#0f172a')
}

export function ThemePanel() {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [accent, setAccent] = useState(SWATCHES[0].value)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem('mis-finanzas-theme') as ThemeMode | null) ?? 'light'
    const savedAccent = localStorage.getItem('mis-finanzas-accent') ?? SWATCHES[0].value
    setTheme(savedTheme)
    setAccent(savedAccent)
    applyTheme(savedTheme, savedAccent)
  }, [])

  useEffect(() => {
    if (theme && accent) {
      applyTheme(theme, accent)
      setIsDirty(true)
    }
  }, [theme, accent])

  const saveTheme = () => {
    localStorage.setItem('mis-finanzas-theme', theme)
    localStorage.setItem('mis-finanzas-accent', accent)
    setIsDirty(false)
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Volver"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Ajustes</p>
          <h2 className="text-lg font-bold text-slate-900">Tema</h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
          <Settings2 className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
            theme === 'light' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          Claro
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
            theme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          Oscuro
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-600">Colores pastel</p>
        <div className="flex items-center justify-between gap-2">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              aria-label={`Seleccionar color ${swatch.name}`}
              onClick={() => setAccent(swatch.value)}
              className={`h-11 w-11 rounded-full border-2 transition ${
                accent === swatch.value ? 'scale-110 border-slate-900 shadow-md' : 'border-white hover:scale-105'
              }`}
              style={{ background: swatch.value }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={saveTheme}
        disabled={!isDirty}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: 'var(--brand)' }}
      >
        <Check className="h-4 w-4" strokeWidth={2.2} />
        Guardar cambios
      </button>
    </section>
  )
}

