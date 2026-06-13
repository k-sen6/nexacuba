# NexaCuba

Marketplace B2B cubano que conecta **mayoristas** y **minoristas** con clientes en toda Cuba. Toda la comunicación se gestiona vía WhatsApp.

## Stack

- **Next.js 15** (App Router, export estático a GitHub Pages)
- **Supabase** (Auth, PostgreSQL, RLS)
- **Tailwind CSS v4** (diseño oscuro custom)
- **Sonner** (toast notifications)

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/productos` | Catálogo público de productos |
| `/tienda?id=X` | Tienda pública de un mayorista |
| `/tienda-minorista?id=X` | Tienda pública de un minorista |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro |
| `/mayorista/dashboard` | Dashboard del mayorista |
| `/mayorista/productos` | CRUD de productos (mayorista) |
| `/mayorista/analytics` | Analíticas (mayorista) |
| `/mayorista/configuracion` | Configuración (mayorista) |
| `/minorista/dashboard` | Dashboard del minorista |
| `/minorista/productos` | CRUD de productos (minorista) |
| `/minorista/analytics` | Analíticas (minorista) |
| `/minorista/configuracion` | Configuración (minorista) |
| `/admin` | Panel de administración |

## Desarrollo

```bash
npm install
npm run dev
```

## Despliegue

El proyecto se despliega automáticamente a GitHub Pages via GitHub Actions. La configuración de export estático está en `next.config.ts`.

## Base de datos

El esquema completo está en `supabase-schema.sql`. Incluye:

- 8 tablas principales
- Row Level Security (RLS) en todas las tablas
- Trigger automático para crear perfiles al registrarse
- Índices optimizados

## Roles de usuario

- **cliente** — Compra productos vía WhatsApp
- **mayorista** — Vende al por mayor, tiene dashboard y CRUD de productos
- **minorista** — Vende al detalle, tiene dashboard y CRUD de productos
- **admin** — Gestiona la plataforma desde el panel de administración
