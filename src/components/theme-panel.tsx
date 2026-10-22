'use client'

import { Check, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type Swatch = {
  id: string
  name: string
  value: string
}

const SWATCHES: Swatch[] = [
  { id: 'copper', name: 'Cobre', value: '#d97724' },
  { id: 'purple', name: 'Morado', value: '#a855f7' },
  { id: 'green', name: 'Verde', value: '#34d399' },
  { id: 'sky', name: 'Azul', value: '#38bdf8' },
  { id: 'rose', name: 'Rosa', value: '#fb7185' },
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
  const soft = adjustHex(safeAccent, 75)
  const strong = adjustHex(safeAccent, -35)

  if (theme === 'dark') {
    root.dataset.theme = 'dark'
    root.style.setProperty('--bg-1', '#050506')
    root.style.setProperty('--bg-2', '#0d0d0e')
    root.style.setProperty('--panel', 'rgba(22, 22, 25, 0.96)')
    root.style.setProperty('--panel-strong', 'rgba(18, 18, 22, 0.96)')
    root.style.setProperty('--line', 'rgba(255, 255, 255, 0.07)')
    root.style.setProperty('--text', '#ffffff')
    root.style.setProperty('--text-soft', '#8a8a93')
    root.style.setProperty('--surface', '#161619')
    root.style.setProperty('--surface-strong', '#1e1e23')
  } else {
    root.dataset.theme = 'light'
    root.style.setProperty('--bg-1', '#f8fbff')
    root.style.setProperty('--bg-2', '#edf6ff')
    root.style.setProperty('--panel', 'rgba(255,255,255,0.72)')
    root.style.setProperty('--panel-strong', 'rgba(255,255,255,0.82)')
    root.style.setProperty('--line', 'rgba(148,163,184,0.2)')
    root.style.setProperty('--text', '#0f172a')
    root.style.setProperty('--text-soft', '#475569')
    root.style.setProperty('--surface', '#ffffff')
    root.style.setProperty('--surface-strong', '#f8fafc')
  }

  root.style.setProperty('--brand', safeAccent)
  root.style.setProperty('--brand-rgb', `${r}, ${g}, ${b}`)
  root.style.setProperty('--brand-soft', soft)
  root.style.setProperty('--brand-strong', strong)
  root.style.setProperty('--hero-start', safeAccent)
  root.style.setProperty('--hero-end', theme === 'dark' ? '#0f172a' : '#1d4ed8')
}

export function ThemePanel() {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [accent, setAccent] = useState(SWATCHES[0].value)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem('mis-finanzas-theme') as ThemeMode | null) ?? 'dark'
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
    <section className="rounded-[28px] border border-[#282830] bg-[#161619] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a93]">Ajustes</p>
          <h2 className="mt-1 text-lg font-bold text-white">Tema y estilo</h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#282830] bg-[#0d0d0e] text-[#8a8a93]">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-[#282830] bg-[#0d0d0e] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Modo</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className="rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
              style={{
                borderColor: theme === 'light' ? 'rgba(var(--brand-rgb), 0.45)' : '#282830',
                background: theme === 'light' ? 'rgba(var(--brand-rgb), 0.12)' : '#161619',
                color: theme === 'light' ? 'var(--brand-strong)' : '#8a8a93',
              }}
            >
              Claro
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className="rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
              style={{
                borderColor: theme === 'dark' ? 'rgba(var(--brand-rgb), 0.45)' : '#282830',
                background: theme === 'dark' ? 'rgba(var(--brand-rgb), 0.12)' : '#161619',
                color: theme === 'dark' ? 'var(--brand-strong)' : '#8a8a93',
              }}
            >
              Oscuro
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#282830] bg-[#0d0d0e] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a93]">Acento</p>
          <div className="flex items-center justify-between gap-2">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch.id}
                type="button"
                aria-label={`Seleccionar color ${swatch.name}`}
                onClick={() => setAccent(swatch.value)}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  accent === swatch.value ? 'scale-110 border-white shadow-lg shadow-black/20' : 'border-transparent hover:scale-105'
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)',
            boxShadow: '0 16px 32px rgba(var(--brand-rgb), 0.22)',
          }}
        >
          <Check className="h-4 w-4" strokeWidth={2.2} />
          Guardar cambios
        </button>
      </div>
    </section>
  )
}

