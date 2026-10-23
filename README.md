# WikiLupe 🦊

WikiLupe es una página para agregar personas del rol de Discord **Comunidad Fachera Fake**. Cada usuario puede crear una cuenta, armar su perfil y subir fichas de personajes con fotos, apodos, elemento, títulos, hazañas, poderes, estadísticas, datos curiosos y un árbol de relaciones entre cuentas.

La aplicación está hecha con **Node.js + Express + EJS + SQLite**, siguiendo la estructura **Modelo · Controlador · Vista**.

---

## ✨ Funcionalidades

- **Registro e inicio de sesión** solo con usuario y contraseña.
- **Contraseñas hasheadas** con bcrypt (12 rondas). Nunca se guardan en texto plano.
- **Sesión persistente de 15 días** usando cookies `HttpOnly` y un almacén de sesiones en SQLite. Al vencer el plazo, la sesión se cierra automáticamente.
- **Perfil** con foto de perfil, nombre de usuario y personajes vinculados.
- **Personajes propios** con:
  - Varias fotos (hasta 12, 8 MB cada una), cada una con su **apodo** (por ejemplo, el nombre de la ropa/outfit).
  - Nombre original universal, descripción, elemento, universo, especie, sexualidad y sexo/género. Especie, religión, estado vital y poderes son de **texto libre**.
  - **Títulos**, **hazañas**, **poderes y habilidades**, rol y estilo de combate.
  - **Historia** del personaje de hasta **20.000 caracteres**.
  - **Información personal**: edad, cumpleaños, estado civil, estado vital, religión y afiliaciones.
  - Estadísticas opcionales **sin límite máximo**: ataque físico, ataque especial, defensa física, defensa especial y velocidad.
  - **Datos curiosos** (uno por línea).
  - **Árbol de relaciones**: familiares, amigos y conocidos. Se pueden vincular personajes de otras cuentas o personajes externos.
  - **Fondo personalizado**: color y/o imagen o GIF propio. Se ve en la ficha y en las tarjetas del personaje.
  - **Formulario de edición plegable** con índice rápido: cada sección se abre y cierra al hacer clic.
  - Categorías: protagonista, co-protagonista, principal, secundario, antagonista, villano, criatura e invocación.
- **Perfiles públicos** en `/usuarios` con los **3 personajes destacados** de cada creador; al entrar al perfil se ven todos sus personajes con vistas previas clicables.
- **Explorador público** con búsqueda y filtros por categoría, elemento y **creador/usuario**.
- **Panel de superadmin** para listar usuarios, ver sus datos, **cambiar contraseñas manualmente**, eliminar cuentas y personajes.
- **Subida de imágenes** con validación de tipo y tamaño.
- **Diseño responsive** con tema oscuro.

---

## 🚀 Instalación y uso

Requisitos: **Node.js 20 o superior** (probado con Node 24) y npm.

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000).

Para desarrollo con recarga automática:

```bash
npm run dev
```

El puerto se puede cambiar en el archivo `.env`.

---

## 🔑 Superadmin

Estas son las credenciales exclusivas que se crean automáticamente la primera vez que arranca el proyecto:

| Campo | Valor |
| --- | --- |
| Usuario | `superadmin` |
| Contraseña | `AdminFachero#2026` |

> **Importante:** cambia estos valores en `.env` **antes del primer arranque** si vas a publicar la página, o cambia la contraseña después desde “Mi perfil” o desde el panel de administración.

Variables disponibles en `.env`:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=una-cadena-larga-y-secreta
SUPERADMIN_USER=superadmin
SUPERADMIN_PASSWORD="AdminFachero#2026"
```

El usuario superadmin se crea con `npm start` o manualmente con:

```bash
npm run seed
```

Si el usuario ya existe, el seed **no pisa** su contraseña; solo asegura que tenga permisos de administración.

---

## 🔐 Cambiar contraseñas olvidadas

### Desde el panel de superadmin (recomendado)

1. Inicia sesión con la cuenta de superadmin.
2. Entra a **Admin** en la barra de navegación.
3. Busca el usuario en la tabla.
4. Escribe la nueva contraseña y presiona **Cambiar**.

Al cambiarla, se cierran todas las sesiones activas de esa persona. La persona puede entrar de inmediato con la nueva contraseña.

### Desde la terminal

Si no puedes entrar al panel, también puedes resetear una contraseña con:

```bash
npm run reset-password -- <usuario> <nueva-contraseña>
```

Ejemplo:

```bash
npm run reset-password -- superadmin "UnaClaveNueva#2026"
```

---

## 🗂️ Estructura del proyecto

```text
Wikilupe/
├── app.js                      # Punto de entrada de Express
├── package.json
├── .env                        # Configuración local
├── .env.example
├── config/
│   ├── database.js             # Conexión SQLite + esquema
│   ├── sessionStore.js         # Sesiones persistentes en SQLite
│   ├── seed.js                 # Creación del superadmin
│   └── constants.js            # Roles, elementos, géneros, etc.
├── models/
│   ├── User.js
│   ├── Character.js
│   ├── CharacterImage.js
│   ├── Fact.js
│   └── Relation.js
├── controllers/
│   ├── homeController.js
│   ├── authController.js
│   ├── profileController.js
│   ├── characterController.js
│   └── adminController.js
├── routes/
│   ├── home.js
│   ├── auth.js
│   ├── profile.js
│   ├── users.js                # Perfiles públicos de la comunidad
│   ├── characters.js
│   └── admin.js
├── middlewares/
│   ├── auth.js                 # Usuario actual, permisos y flashes
│   └── upload.js               # Multer (avatares, fotos y fondos)
├── utils/
│   ├── files.js
│   ├── sessions.js
│   └── validation.js
├── views/
│   ├── partials/               # Head, footer y tarjeta de personaje
│   ├── index.ejs
│   ├── profile.ejs
│   ├── auth/
│   ├── characters/
│   ├── users/                  # Directorio y perfil público
│   ├── admin/
│   └── errors/
├── public/
│   ├── css/style.css
│   ├── js/app.js
│   ├── favicon.svg
│   └── uploads/                # Avatares y fotos subidas
├── scripts/
│   └── reset-password.js
└── data/
    └── wikilupe.db             # Base de datos (se crea sola)
```

---

## 🧩 Categorías de personajes

- Protagonista
- Co-protagonista
- Principal
- Secundario
- Antagonista
- Villano
- Criatura
- Invocación

Cada categoría tiene su propio color y se puede filtrar desde `/personajes`.

## 🔥 Elementos

La lista incluye Fuego, Agua, Viento, Tierra, Rayo, Hielo, Luz, Oscuridad, Naturaleza, Veneno, Sonido, Gravedad, Espacio, Tiempo, Sangre, Sombra, Metal, Psíquico, Arcana y Ninguno. El campo permite escribir un elemento personalizado.

Cada elemento tiene una paleta pastel y un símbolo propio. Si el personaje usa el color automático, la ficha toma esa paleta; también se puede elegir un color hexadecimal personalizado.

## 📋 Campos de la ficha

| Campo | Descripción |
| --- | --- |
| Títulos | Uno por línea; se muestran como distintivos junto al nombre. |
| Hazañas | Logros y momentos importantes del personaje. |
| Rol de combate | Atacante, tanque, sanador, soporte, control, etc. |
| Estilo de combate | Cómo pelea el personaje. |
| Poderes y habilidades | Explicación libre de sus capacidades. |
| Estado civil | Soltero/a, casado/a, en pareja, etc. |
| Estado vital | Situación actual del personaje (vivo/a, desaparecido/a, etc.). Texto libre. |
| Cumpleaños | Texto libre para admitir solo día y mes. |
| Edad | Texto libre para admitir edades no humanas. |
| Universo | Universo o realidad a la que pertenece. |
| Afiliaciones | Organizaciones, gremios o grupos. |
| Religión | Creencia o culto del personaje. Texto libre. |
| Especie | Humano, elfo, demonio, criatura, etc. Texto libre. |
| Historia | Relato largo del personaje, hasta 20.000 caracteres. |
| Color de fondo | Color hexadecimal de la ficha con splash art animado. |
| Imagen/GIF de fondo | Imagen propia que se muestra en la ficha y en las tarjetas. |

---

## 🗃️ Base de datos

Se usa **SQLite** mediante `better-sqlite3`. El archivo se crea automáticamente en `data/wikilupe.db`.

Tablas principales:

- `users` — cuentas y roles de administración.
- `sessions` — sesiones persistentes con vencimiento.
- `characters` — fichas de personajes.
- `character_images` — fotos y apodo de cada foto.
- `character_facts` — datos curiosos.
- `relations` — árbol de relaciones entre personajes.

Las claves foráneas están activas: al eliminar un personaje se eliminan sus fotos, datos y relaciones; al eliminar una cuenta se eliminan sus personajes.

---

## 🛡️ Notas de seguridad y producción

- Las contraseñas usan **bcrypt** con 12 rondas.
- Las sesiones se guardan en SQLite y la cookie es `HttpOnly` + `SameSite=Lax`, con vencimiento a los 15 días.
- Cambia `SESSION_SECRET` y las credenciales del superadmin en producción.
- Con `NODE_ENV=production` la cookie se marca como `Secure`, por lo que el sitio debe servirse con **HTTPS** (por ejemplo, detrás de Nginx o un proxy).
- Las imágenes se validan por tipo MIME y tamaño máximo. Se guardan con nombres aleatorios en `public/uploads`.
- Para un despliegue público se recomienda agregar limitación de intentos de login y copias de seguridad de `data/` y `public/uploads/`.

---

## 📜 Scripts

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia con recarga automática |
| `npm run seed` | Crea el superadmin si no existe |
| `npm run reset-password -- usuario clave` | Cambia una contraseña desde la terminal |

Hecho para la **Comunidad Fachera Fake** 💅
