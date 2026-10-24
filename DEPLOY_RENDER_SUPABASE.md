# Desplegar WikiLupe en Render + Supabase (Postgres + Storage)

## 1) Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → Crear proyecto
2. Guardar `Project URL` y `anon key` (no las uses, vamos con service role)
3. Ir a `Settings > API` → copiar `service_role key` (NUNCA lo subas a frontend)
4. Ir a `Storage > Buckets` → Crear bucket `wikilupe-uploads` (marcarlo como **Public**)

## 2) Crear tablas

1. Ir a `SQL Editor` → New query
2. Copiar todo el contenido de `supabase/schema.sql` y ejecutar
3. Deberías ver las tablas `users`, `session`, `characters`, `character_images`, `character_facts`, `relations`

## 3) Configurar RLS para Storage (importante)

Ir a `Storage > Policies` para el bucket `wikilupe-uploads` y crear estas policies (o usar SQL):

**Permitir lectura pública**
```sql
create policy "Public read"
on storage.objects for select
using (bucket_id = 'wikilupe-uploads');
```

**Permitir subida (con service_role desde backend ya pasa, pero por seguridad)**
Con `SUPABASE_SERVICE_ROLE_KEY` desde el backend se puede subir sin pasar por estas policies estrictas. Aun así es recomendable tenerlas.

**Permitir borrado desde backend**
Con service_role también funciona.

## 4) Subir código a GitHub

Sube todo este repo modificado a GitHub (sin `.env`, sin `node_modules`).

## 5) Desplegar en Render

1. Ir a [render.com](https://render.com) → New + Web Service → Connect GitHub
2. Seleccionar el repo `wikilupe`
3. Configurar:
   - **Name:** `wikilupe`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (o Starter si quieres evitar cold start)
   - **Auto-Deploy:** Yes

## 6) Variables de entorno en Render

Añadir estas variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | Cadena larga aleatoria (mínimo 32 chars) |
| `SUPERADMIN_USER` | `superadmin` |
| `SUPERADMIN_PASSWORD` | Contraseña fuerte |
| `DATABASE_URL` | Connection string de Supabase (Settings > Database > Connection string > URI) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service_role) |
| `SUPABASE_STORAGE_BUCKET` | `wikilupe-uploads` |

> En Supabase, usa el **Connection string** en modo "Session pooler" o "Direct connection". Para Render Free suele ir bien con Session pooler.

## 7) Crear superadmin

Tras el primer deploy, abre la shell de Render o ejecuta local con esas variables apuntando a Supabase:

```bash
npm run seed
```

O simplemente arranca y `app.js` llama a `seedSuperadmin()` automáticamente.

## 8) Probar

1. Abrir la URL de Render
2. Loguearte con superadmin
3. Crear personaje y subir foto → debe aparecer desde Supabase Storage
4. Comprobar que persiste tras redeploy

## Trucos

- **Cold start:** Si usas plan Free, tras 15 min se duerme. La primera visita tarda ~30-60s.
- **50MB límite:** Supabase Storage Free permite 50MB por archivo, pero tu app sigue limitando a 8MB/4MB que está más que bien.
- **Pausado Supabase:** Si nadie entra 7 días, Supabase pausa el proyecto. Con tráfico mínimo se mantiene despierto.
- **Migrar datos antiguos:** Si quieres pasar tu `wikilupe.db` actual, hay que exportar a CSV/JSON e insertar a Postgres. Puedo ayudarte con eso si lo necesitas.
