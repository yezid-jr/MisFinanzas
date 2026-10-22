'use client'

import { useState } from 'react'
import { deleteMovementGroup } from '@/lib/actions'

export default function DeleteGroupButton({ groupId }: { groupId: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          if (!confirm('¿Borrar este movimiento completo? Los saldos se recalcularán.')) return
          setPending(true)
          const res = await deleteMovementGroup(groupId)
          setError(res.ok ? null : res.error)
          setPending(false)
        }}
        className="text-xs text-slate-400 underline disabled:opacity-50"
      >
        {pending ? 'Borrando…' : 'Borrar'}
      </button>
      {error && <p className="text-[10px] text-rose-600">{error}</p>}
    </div>
  )
}
