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

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const value = Number.parseInt(full, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function adjustHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const mix = (value: number) => Math.max(0, Math.min(255, value + amount))
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

function applyTheme(theme: ThemeMode, accent: string) {
  const root = document.documentElement
  const safeAccent = accent || SWATCHES[0].value
  const { r, g, b } = hexToRgb(safeAccent)

  if (theme === 'dark') {
    root.dataset.theme = 'dark'
    root.style.setProperty('--bg-1', '#07111f')
    root.style.setProperty('--bg-2', '#111827')
    root.style.setProperty('--panel', 'rgba(15, 23, 42, 0.56)')
    root.style.setProperty('--panel-strong', 'rgba(17, 24, 39, 0.7)')
    root.style.setProperty('--line', 'rgba(148, 163, 184, 0.18)')
    root.style.setProperty('--text', '#e5eefb')
    root.style.setProperty('--text-soft', '#cbd5e1')
    root.style.setProperty('--surface', '#0f172a')
    root.style.setProperty('--surface-strong', '#111827')
  } else {
    root.dataset.theme = 'light'
    root.style.setProperty('--bg-1', '#f8fbff')
    root.style.setProperty('--bg-2', '#edf6ff')
    root.style.setProperty('--panel', 'rgba(255, 255, 255, 0.52)')
    root.style.setProperty('--panel-strong', 'rgba(255, 255, 255, 0.72)')
    root.style.setProperty('--line', 'rgba(148,163,184,0.18)')
    root.style.setProperty('--text', '#0f172a')
    root.style.setProperty('--text-soft', '#475569')
    root.style.setProperty('--surface', '#ffffff')
    root.style.setProperty('--surface-strong', '#f8fafc')
  }

  root.style.setProperty('--brand', safeAccent)
  root.style.setProperty('--brand-rgb', `${r}, ${g}, ${b}`)
  root.style.setProperty('--brand-soft', adjustHex(safeAccent, 75))
  root.style.setProperty('--brand-strong', adjustHex(safeAccent, -35))
  root.style.setProperty('--hero-start', adjustHex(safeAccent, 14))
  root.style.setProperty('--hero-end', theme === 'dark' ? '#0f172a' : '#1d4ed8')
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
    applyTheme(theme, accent)
    setIsDirty(true)
  }, [theme, accent])

  const saveTheme = () => {
    localStorage.setItem('mis-finanzas-theme', theme)
    localStorage.setItem('mis-finanzas-accent', accent)
    setIsDirty(false)
  }

  return (
    <section className="glass-panel space-y-4 rounded-[28px] p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Volver"
          className="glass-button flex h-10 w-10 items-center justify-center rounded-full text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Ajustes</p>
          <h2 className="text-lg font-bold text-slate-900">Tema</h2>
        </div>

        <div className="glass-button flex h-10 w-10 items-center justify-center rounded-full text-slate-700">
          <Settings2 className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
            theme === 'light' ? 'border-white/40 bg-slate-900 text-white shadow-lg shadow-slate-900/15' : 'border-white/30 bg-white/10 text-slate-700 backdrop-blur-md'
          }`}
        >
          Claro
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
            theme === 'dark' ? 'border-white/40 bg-slate-900 text-white shadow-lg shadow-slate-900/15' : 'border-white/30 bg-white/10 text-slate-700 backdrop-blur-md'
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
                accent === swatch.value ? 'scale-110 border-slate-900 shadow-md' : 'border-white/70 hover:scale-105'
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--brand))' }}
      >
        <Check className="h-4 w-4" strokeWidth={2.2} />
        Guardar cambios
      </button>
    </section>
  )
}

