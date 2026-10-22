'use server'

import { createClient } from '@/lib/supabase/server'
import { loadUpcoming } from '@/lib/data'
import { buildDigest } from '@/lib/alerts'
import { sendPush, type PushPayload } from '@/lib/push'

export type PushResult = { ok: true; message: string } | { ok: false; error: string }

export async function savePushSubscription(input: {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}): Promise<PushResult> {
  if (!input.endpoint || !input.p256dh || !input.auth) {
    return { ok: false, error: 'La suscripción llegó incompleta' }
  }
  const supabase = await createClient()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent?.slice(0, 200) ?? null,
    },
    { onConflict: 'endpoint' }
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true, message: 'Notificaciones activadas' }
}

export async function removePushSubscription(endpoint: string): Promise<PushResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) return { ok: false, error: error.message }
  return { ok: true, message: 'Notificaciones desactivadas' }
}

/** Envía tus alertas reales (si hay) o un mensaje de prueba a tus dispositivos */
export async function sendTestPush(): Promise<PushResult> {
  const supabase = await createClient()
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint,p256dh,auth')
  if (error) return { ok: false, error: error.message }
  if (!subs || subs.length === 0) return { ok: false, error: 'Aún no tienes ningún dispositivo suscrito' }

  const { items } = await loadUpcoming()
  const digest = buildDigest(items)
  const payload: PushPayload = digest ?? {
    title: '✅ Notificaciones funcionando',
    body: 'No tienes cobros para hoy, mañana ni en 3 días. Así te avisaré cuando los haya.',
    url: '/cobros',
    tag: 'prueba',
  }

  try {
    let sent = 0
    for (const s of subs) {
      const status = await sendPush(s, payload)
      if (status === 'ok') sent++
      if (status === 'gone') await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
    }
    if (sent === 0) return { ok: false, error: 'No se pudo entregar. Desactiva y activa de nuevo las notificaciones.' }
    return { ok: true, message: `Enviada a ${sent} dispositivo(s) 🔔` }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error enviando la notificación' }
  }
}
