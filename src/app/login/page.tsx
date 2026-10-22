import GoogleButton from '@/components/google-button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <div className="text-5xl">💸</div>
        <h1 className="mt-3 text-2xl font-bold">Mis Finanzas</h1>
        <p className="mt-1 text-sm text-slate-500">Tus cajas, ingresos y deudas en un solo lugar</p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          No se pudo iniciar sesión. Intenta de nuevo.
        </p>
      )}
      <GoogleButton />
    </main>
  )
}