'use client'

import { useEffect } from 'react'

/** Registra el service worker al abrir la app (necesario para las notificaciones) */
export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
