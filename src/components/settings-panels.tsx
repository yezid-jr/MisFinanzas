'use client'

import { useEffect, useState, useTransition } from 'react'
import { removePushSubscription, savePushSubscription, sendTestPush } from '@/lib/push-actions'

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function InstallPanel() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold">📲 Instalar la app</h2>
      {installed ? (
        <p className="text-sm text-emerald-700">Ya la tienes instalada ✅</p>
      ) : installEvent ? (
        <>
          <p className="text-sm text-slate-500">Ábrela desde tu pantalla de inicio, como cualquier otra app.</p>
          <button
            onClick={async () => {
              await installEvent.prompt()
              setInstallEvent(null)
            }}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white"
          >
            Instalar
          </button>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          En Chrome abre el menú ⋮ y toca <b>Instalar app</b> (o <b>Agregar a la pantalla principal</b>). Funciona
          solo desde la dirección pública (HTTPS), no desde localhost.
        </p>
      )}
    </section>
  )
}

type PushState = 'loading' | 'unsupported' | 'denied' | 'off' | 'on'

export function NotificationsPanel() {
  const [state, setState] = useState<PushState>('loading')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    ;(async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setState('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setState('denied')
        return
      }
      const reg = await navigator.serviceWorker.register('/sw.js')
      const sub = await reg.pushManager.getSubscription()
      setState(sub ? 'on' : 'off')
    })().catch(() => setState('unsupported'))
  }, [])

  function enable() {
    startTransition(async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) throw new Error('Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY en las variables de entorno')

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setState(permission === 'denied' ? 'denied' : 'off')
          return
        }
        const reg = await navigator.serviceWorker.ready
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          }))
        const json = sub.toJSON()
        const res = await savePushSubscription({
          endpoint: json.endpoint ?? '',
          p256dh: json.keys?.p256dh ?? '',
          auth: json.keys?.auth ?? '',
          userAgent: navigator.userAgent,
        })
        if (!res.ok) throw new Error(res.error)
        setState('on')
        setMessage({ ok: true, text: 'Notificaciones activadas en este dispositivo ✅' })
      } catch (e) {
        setMessage({ ok: false, text: e instanceof Error ? e.message : 'No se pudo activar' })
      }
    })
  }

  function disable() {
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await removePushSubscription(sub.endpoint)
          await sub.unsubscribe()
        }
        setState('off')
        setMessage({ ok: true, text: 'Notificaciones desactivadas' })
      } catch (e) {
        setMessage({ ok: false, text: e instanceof Error ? e.message : 'No se pudo desactivar' })
      }
    })
  }

  function test() {
    startTransition(async () => {
      const res = await sendTestPush()
      setMessage(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error })
    })
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold">🔔 Notificaciones</h2>
      <p className="text-sm text-slate-500">
        Cada mañana te aviso de lo que vence hoy, mañana o en 3 días, y si una caja no alcanza para pagarlo.
      </p>

      {state === 'loading' && <p className="text-sm text-slate-400">Revisando…</p>}
      {state === 'unsupported' && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Este navegador no soporta notificaciones push. Usa Chrome en Android.
        </p>
      )}
      {state === 'denied' && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Bloqueaste las notificaciones. Actívalas en los permisos del sitio (candado junto a la dirección) y recarga.
        </p>
      )}
      {state === 'off' && (
        <button
          onClick={enable}
          disabled={pending}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Activando…' : 'Activar en este dispositivo'}
        </button>
      )}
      {state === 'on' && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={test}
            disabled={pending}
            className="rounded-xl bg-slate-900 px-3 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? 'Enviando…' : 'Enviar prueba'}
          </button>
          <button
            onClick={disable}
            disabled={pending}
            className="rounded-xl border border-slate-300 px-3 py-3 text-sm disabled:opacity-50"
          >
            Desactivar
          </button>
        </div>
      )}

      {message && (
        <p
          className={`rounded-lg p-3 text-sm ${
            message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  )
}
