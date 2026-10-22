'use client'

import { useEffect } from 'react'

type ThemeMode = 'light' | 'dark' | 'custom'

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = Number.parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function adjustHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const mix = (value: number) => Math.max(0, Math.min(255, value + amount))
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
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

export default function ThemeInit() {
  useEffect(() => {
    const savedTheme = (localStorage.getItem('mis-finanzas-theme') as ThemeMode | null) ?? 'light'
    const savedAccent = localStorage.getItem('mis-finanzas-accent') ?? '#2563eb'
    applyTheme(savedTheme, savedAccent)
  }, [])

  return null
}
