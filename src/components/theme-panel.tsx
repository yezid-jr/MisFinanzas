'use client'

import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'custom'

const PRESETS = [
  { id: 'light', label: 'Claro', accent: '#2563eb' },
  { id: 'dark', label: 'Oscuro', accent: '#7c3aed' },
  { id: 'custom', label: 'Personalizado', accent: '#14b8a6' },
] as const

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
  const safeAccent = accent || '#2563eb'

  if (theme === 'dark') {
    root.dataset.theme = 'dark'
    root.style.setProperty('--bg-1', '#020817')
    root.style.setProperty('--bg-2', '#0f172a')
    root.style.setProperty('--panel', 'rgba(15, 23, 42, 0.82)')
    root.style.setProperty('--panel-strong', 'rgba(15, 23, 42, 0.95)')
    root.style.setProperty('--line', 'rgba(148, 163, 184, 0.18)')
    root.style.setProperty('--text', '#e2e8f0')
    root.style.setProperty('--text-soft', '#94a3b8')
    root.style.setProperty('--surface', '#111827')
    root.style.setProperty('--surface-strong', '#1f2937')
    root.style.setProperty('--brand', safeAccent)
    root.style.setProperty('--brand-soft', adjustHex(safeAccent, 76))
    root.style.setProperty('--brand-strong', adjustHex(safeAccent, -35))
    root.style.setProperty('--hero-start', adjustHex(safeAccent, 18))
    root.style.setProperty('--hero-end', '#0f172a')
  } else if (theme === 'custom') {
    root.dataset.theme = 'custom'
    root.style.setProperty('--bg-1', '#f8fbff')
    root.style.setProperty('--bg-2', '#eef6ff')
    root.style.setProperty('--panel', 'rgba(255,255,255,0.8)')
    root.style.setProperty('--panel-strong', 'rgba(255,255,255,0.95)')
    root.style.setProperty('--line', 'rgba(148,163,184,0.2)')
    root.style.setProperty('--text', '#0f172a')
    root.style.setProperty('--text-soft', '#475569')
    root.style.setProperty('--surface', '#ffffff')
    root.style.setProperty('--surface-strong', '#f8fafc')
    root.style.setProperty('--brand', safeAccent)
    root.style.setProperty('--brand-soft', adjustHex(safeAccent, 70))
    root.style.setProperty('--brand-strong', adjustHex(safeAccent, -35))
    root.style.setProperty('--hero-start', adjustHex(safeAccent, 10))
    root.style.setProperty('--hero-end', '#1d4ed8')
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
    root.style.setProperty('--brand', '#2563eb')
    root.style.setProperty('--brand-soft', '#dbeafe')
    root.style.setProperty('--brand-strong', '#1d4ed8')
    root.style.setProperty('--hero-start', '#1d4ed8')
    root.style.setProperty('--hero-end', '#0f172a')
  }
}

export function ThemePanel() {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [accent, setAccent] = useState('#2563eb')

  useEffect(() => {
    const savedTheme = (localStorage.getItem('mis-finanzas-theme') as ThemeMode | null) ?? 'light'
    const savedAccent = localStorage.getItem('mis-finanzas-accent') ?? '#2563eb'
    setTheme(savedTheme)
    setAccent(savedAccent)
    applyTheme(savedTheme, savedAccent)
  }, [])

  useEffect(() => {
    localStorage.setItem('mis-finanzas-theme', theme)
    localStorage.setItem('mis-finanzas-accent', accent)
    applyTheme(theme, accent)
  }, [theme, accent])

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold">🎨 Tema y colores</h2>

      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setTheme(preset.id as ThemeMode)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              theme === preset.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Color principal</span>
          <span className="font-medium text-slate-800">{accent}</span>
        </label>
        <input
          type="color"
          value={accent}
          onChange={(e) => {
            setAccent(e.target.value)
            setTheme('custom')
          }}
          className="h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
      </div>
    </section>
  )
}
