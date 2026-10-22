import webpush from 'web-push'

export type PushSub = { endpoint: string; p256dh: string; auth: string }
export type PushPayload = { title: string; body: string; url?: string; tag?: string }

let configured = false

function configure() {
  if (configured) return
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com'
  if (!pub || !priv) throw new Error('Faltan las llaves VAPID en las variables de entorno')
  webpush.setVapidDetails(subject, pub, priv)
  configured = true
}

/** 'gone' = la suscripción ya no existe (hay que borrarla) */
export async function sendPush(sub: PushSub, payload: PushPayload): Promise<'ok' | 'gone' | 'error'> {
  configure()
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    )
    return 'ok'
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode
    return status === 404 || status === 410 ? 'gone' : 'error'
  }
}
