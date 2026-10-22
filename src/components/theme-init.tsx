'use client'

import { useEffect } from 'react'

type ThemeMode = 'light' | 'dark'

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
  const safeAccent = accent || '#c4b5fd'
  const { r, g, b } = hexToRgb(safeAccent)

  if (theme === 'dark') {
    root.dataset.theme = 'dark'
    root.style.setProperty('--bg-1', '#07111f')
    root.style.setProperty('--bg-2', '#111827')
    root.style.setProperty('--panel', 'rgba(15, 23, 42, 0.56)')
    root.style.setProperty('--panel-strong', 'rgba(17, 24, 39, 0.72)')
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

export default function ThemeInit() {
  useEffect(() => {
    const savedTheme = (localStorage.getItem('mis-finanzas-theme') as ThemeMode | null) ?? 'light'
    const savedAccent = localStorage.getItem('mis-finanzas-accent') ?? '#c4b5fd'
    applyTheme(savedTheme, savedAccent)
  }, [])

  return null
}
