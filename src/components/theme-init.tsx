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
    root.style.setProperty('--bg-1', '#1b1d22')
    root.style.setProperty('--bg-2', '#2a2f39')
    root.style.setProperty('--panel', 'rgba(23, 27, 33, 0.76)')
    root.style.setProperty('--panel-strong', 'rgba(18, 21, 27, 0.88)')
    root.style.setProperty('--line', 'rgba(148, 163, 184, 0.16)')
    root.style.setProperty('--text', '#edf4ff')
    root.style.setProperty('--text-soft', '#b8c2d3')
    root.style.setProperty('--surface', '#171b22')
    root.style.setProperty('--surface-strong', '#1f2630')
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

  root.style.setProperty('--brand', '#d97724')
  root.style.setProperty('--brand-rgb', '217, 119, 36')
  root.style.setProperty('--brand-soft', '#f7c07a')
  root.style.setProperty('--brand-strong', '#e08a3e')
  root.style.setProperty('--hero-start', '#d97724')
  root.style.setProperty('--hero-end', '#0f172a')
}

export default function ThemeInit() {
  useEffect(() => {
    const savedTheme = (localStorage.getItem('mis-finanzas-theme') as ThemeMode | null) ?? 'dark'
    const savedAccent = localStorage.getItem('mis-finanzas-accent') ?? '#d97724'
    applyTheme(savedTheme, savedAccent)
  }, [])

  return null
}
