# Mis Finanzas

Aplicación web para controlar finanzas personales con enfoque móvil, PWA e integración con Supabase.

## Descripción

Mis Finanzas es una app para:

- Registrar ingresos, gastos, transferencias y ajustes.
- Organizar dinero por cajas o bolsillos.
- Controlar deudas, cuotas, tarjetas y recurrentes.
- Monitorear el rendimiento estimado y los próximos cobros.
- Exportar copias de seguridad.
- Recibir notificaciones push cuando hay pagos próximos o alertas financieras.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)
- Vercel
- PWA + Service Worker
- web-push para notificaciones

## Funcionalidades principales

- Dashboard con resumen mensual y total por caja.
- Cajas / pockets con objetivos y priorización.
- Ingresos y gastos por categoría.
- Transferencias entre cajas.
- Deudas, cuotas y pagos.
- Pagos recurrentes.
- Historico de movimientos.
- Conciliación de balances.
- Metas y reportes.
- Respaldo JSON / CSV.
- Notificaciones push para alertas diarias.
- Instalación como app en móvil y escritorio.

## Estructura del proyecto

```bash
.
├── public/
│   ├── icons/
│   ├── sw.js
│   └── ...
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── proxy.ts
├── .env.local
├── fase3.sql
├── vercel.json
├── package.json
├── tsconfig.json
├── next.config.ts
├── README.md
└── ...
```

## Requisitos previos

- Node.js 20+
- npm
- Cuenta de Supabase
- Proyecto desplegado en Vercel (opcional, pero recomendado para push y cron)
- Navegador que soporte PWA (Chrome/Edge recomendado)

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_public_vapid_key
VAPID_PRIVATE_KEY=tu_private_vapid_key
VAPID_SUBJECT=mailto:tucorreo@gmail.com
CRON_SECRET=una_cadena_larga_secreta
```

3. Inicia el proyecto:

```bash
npm run dev
```

Abre:

```text
http://localhost:3000
```

## Base de datos de Supabase

La estructura principal del esquema es esta:

### settings
- `user_id` (PK)
- `nu_rate_ea`
- `start_date`

### accounts
- `id`
- `user_id`
- `name`
- `kind` (`nu`, `bancolombia`, `nequi`, `cash`, `other`)
- `gmf_exempt`

### pockets
- `id`
- `user_id`
- `account_id`
- `name`
- `emoji`
- `priority`
- `goal`
- `pct_work`
- `pct_tattoo`
- `earns_yield`
- `is_active`
- `notes`

### categories
- `id`
- `user_id`
- `name`
- `emoji`
- `default_pocket_id`

### movements
- `id`
- `user_id`
- `group_id`
- `occurred_on`
- `kind`
- `pocket_id`
- `amount`
- `category_id`
- `income_source`
- `note`

### debts
- `id`
- `user_id`
- `name`
- `kind`
- `rate_ea`
- `credit_limit`
- `cutoff_day`
- `due_day`
- `default_pocket_id`
- `is_active`
- `notes`

### debt_entries
- `id`
- `user_id`
- `debt_id`
- `group_id`
- `occurred_on`
- `kind`
- `amount`
- `note`

### debt_installments
- `id`
- `user_id`
- `debt_id`
- `due_on`
- `amount`
- `paid_at`

### recurring_charges
- `id`
- `user_id`
- `name`
- `category_id`
- `pocket_id`
- `amount`
- `day_of_month`
- `is_active`
- `notes`
- `last_posted_on`

### push_subscriptions
- `id`
- `user_id`
- `endpoint`
- `p256dh`
- `auth`
- `user_agent`

## SQL recomendado para Supabase

Se incluye un ejemplo base en [fase3.sql](fase3.sql). Este archivo crea la tabla de suscripciones push y permite que la app registre dispositivos para notificaciones.

## Notificaciones push

Para activar push:

1. Genera las keys VAPID:

```bash
npx web-push generate-vapid-keys
```

2. Copia la clave pública al `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
3. Copia la clave privada a `VAPID_PRIVATE_KEY`.
4. Configura `VAPID_SUBJECT` con un email o URL válida.
5. Asegúrate de que el dominio tenga HTTPS o esté desplegado en Vercel.

## Cron de alertas

La app incluye la ruta:

```text
/api/cron/alerts
```

Y el archivo [vercel.json](vercel.json) define un cron diario para enviar notificaciones por alertas. Para proteger la ruta, usa `CRON_SECRET` y el header `Authorization: Bearer <CRON_SECRET>`.

## Despliegue en Vercel

1. Conecta este repositorio a Vercel.
2. Define todas las variables de entorno del archivo `.env.local`.
3. Usa `next build` como build command y `next start` como output.
4. Asegúrate de que el dominio sea HTTPS para PWA y notificaciones.

## Seguridad

- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el navegador.
- Usa RLS en Supabase para aislar datos por usuario.
- Mantén `CRON_SECRET` en secreto.

## Roadmap sugerido

- Mejorar dashboard con gráficos avanzados.
- Añadir filtros por mes y categorías.
- Crear export más robusto con archivos comprimidos.
- Añadir autenticación con roles y permisos.
- Mejorar UX/PWA con widgets y home screen install flow.

## Autor

Proyecto personal para gestión financiera y control de cashflow.
