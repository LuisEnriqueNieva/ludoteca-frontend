# Ludoteca — Frontend

Panel web (React + Vite) que consume los 5 microservicios del proyecto **Ludoteca / Juegos de Mesa**. Cada microservicio tiene su propia pestaña en la interfaz, todas orquestadas bajo un único API Gateway.

## Cómo trabaja de verdad el frontend

- **Un solo punto de entrada:** todo sale por el API Gateway configurado en `VITE_API_GATEWAY_URL` (actualmente apunta a `https://gd2m5wlwsh.execute-api.us-east-1.amazonaws.com`). El Gateway enruta por ruta: `/juegos/*`, `/editoriales/*`, `/partidas/*`, `/clientes/*`, `/perfil`, `/analitica/*` (rutas desnudas, sin stage ni prefijo).
- **Sin mocks:** la app consulta los backends reales a través del Gateway. No existe `VITE_USE_MOCKS` ni carpeta `mocks/`.
- **Overrides por servicio (dev):** `config.js` permite sobreescribir un microservicio puntual con `VITE_CATALOGO_URL`, `VITE_PARTIDAS_URL`, `VITE_MEMBRESIAS_URL`, `VITE_PERFIL_URL`, `VITE_ANALITICA_URL`. Si no se definen, todo sale por `VITE_API_GATEWAY_URL`. Último fallback: `localhost:800X`.
- **Pestañas reales de la UI:**
  - **Panel Operativo** — orquesta los 5 servicios en una sola vista: KPIs (catálogo, partidas, mesas activas, clientes, reservas), arquitectura de microservicios con acceso a cada pestaña, horario de mayor demanda (SVG), últimas partidas (con botón que abre el detalle en la pestaña Partidas) y próximas reservas confirmadas. Polling cada 20s.
  - **Catálogo** — lista de juegos con filtro en vivo por nombre y consulta de detalle por ID.
  - **Partidas** — CRUD completo (`GET/POST/PUT/DELETE`), filtro por jugador y consulta por ID. Al registrar, el campo de juego acepta **ID numérico o nombre exacto** (lo resuelve contra el catálogo).
  - **Reservas** — lista de clientes y membresías, reservas por cliente y registro de nueva reserva (mesa + horario ISO + estado).
  - **Clientes** — ficha de cliente (agregador): partidas jugadas, membresía, juegos más frecuentes y próximas reservas.
  - **Analítica** — juegos más jugados, reservas totales según membresía y horario de mayor demanda.
- **Healthcheck:** el footer verifica cada 30s (≈) si los 5 servicios responden a través del Gateway (`src/services/health.js`), mostrando `X/5 servicios respondiendo`.

## Paleta de colores

La identidad visual se define con variables CSS en `:root` del archivo `src/index.css`. Cambiar un valor ahí actualiza toda la interfaz.

| Variable | Valor | Uso |
|---|---|---|
| `--yellow` | `#ffce12` | **Acento de marca** (amarillo): logo, foco de inputs, subrayados, gráfico de demanda |
| `--primary` / `--primary-container` | `#ae0065` / `#db0080` | Magenta: botones principales, nav activa, valores destacados |
| `--primary-fixed` / `--primary-fixed-dim` | `#ffd9e4` / `#ffb0cc` | Tintes magenta (avatars, contenedores claros) |
| `--secondary` / `--secondary-container` | `#5e588c` / `#cac2fd` | Violeta: metadatos, iconos secundarios |
| `--tertiary` / `--tertiary-container` | `#735c00` / `#cfa700` | Ámbar oscuro (texto sobre fondos claro) |
| `--navy` / `--navy-soft` | `#0b0336` / `#160d47` | Header, footer y botones oscuros |
| `--surface` / `--surface-lowest` | `#fff9ee` / `#ffffff` | Fondo general (crema) y tarjetas |
| `--surface-container` / `--surface-high` | `#f5eddb` / `#efe8d5` | Superficies intermedias |
| `--on-surface` / `--on-surface-variant` | `#1e1c10` / `#5a4048` | Texto principal / secundario |
| `--error` / `--error-container` | `#ba1a1a` / `#ffdad6` | Estados de error |
| `--green-100/500/700` | `#dcfce7` / `#22c55e` / `#15803d` | Estados "en línea / OK" |
| `--outline` / `--outline-variant` | `#8d6f79` / `#e1bdc8` | Bordes |
| `--font-display / --font-body / --font-code` | Epilogue / Plus Jakarta Sans / JetBrains Mono | Titulares / cuerpo / mono |
| Clayful | (`fonts.cdnfonts.com`) | Logo de marca "Ludoteca" |

El **logo (dado)** usa un degradado fijo amarillo→magenta (`#ffce12 → #db0080`) definido en `.brand-icon` de `src/index.css`.

## Microservicios y endpoints consumidos

| Servicio | Archivo de servicio | Endpoints consumidos |
|---|---|---|
| Catálogo de juegos | `src/services/catalogoApi.js` | `GET /juegos`, `GET /juegos/{id}`, `GET /editoriales` |
| Partidas jugadas | `src/services/partidasApi.js` | `GET /partidas`, `GET /partidas/{id}`, `GET /partidas?jugador=`, `POST /partidas`, `PUT /partidas/{id}`, `DELETE /partidas/{id}` |
| Membresías y reservas | `src/services/membresiasApi.js` | `GET /clientes`, `GET /clientes/{id}/reservas`, `POST /clientes/{id}/reservas` |
| Perfil de jugador (agregador) | `src/services/perfilApi.js` | `GET /perfil?nombre_jugador=`, `GET /perfil/lista` |
| Analítica | `src/services/analiticaApi.js` | `GET /analitica/juego-mas-jugado`, `GET /analitica/membresia-vs-frecuencia`, `GET /analitica/horario-pico` |

## Ejecutar en local

```bash
npm install
cp .env.example .env.local   # define VITE_API_GATEWAY_URL (u overrides por servicio)
npm run dev
```

`VITE_*` se hornean en el build de Vite: tras cambiar alguna variable hay que recompilar (`npm run build`) o redeployar.

## Formas de datos que el frontend espera

Para que cada vista renderice sin campos vacíos, los backends deben devolver estas formas:

| Endpoint | Respuesta esperada |
|---|---|
| `GET /juegos` | `[{ id, titulo, genero, complejidad, jugadores_min, jugadores_max, editorial_id }]` |
| `GET /juegos/{id}` | un objeto `juego` como el anterior |
| `GET /editoriales` | `[{ id, nombre }]` |
| `GET /partidas` | `[{ id, mesa, juego_id, fecha, resultado, partida_jugadores: [{ id, nombre_jugador }] }]` |
| `GET /partidas/{id}` | una `partida` como la anterior |
| `GET /clientes` | `[{ _id, nombre, plan, reservas: [{ mesa, horario, estado }] }]` (se usa `_id`, es MongoDB) |
| `GET /clientes/{id}/reservas` | array de `reservas` |
| `POST /clientes/{id}/reservas` | recibe `{ mesa, horario, estado }`, devuelve la reserva creada |
| `GET /perfil?nombre_jugador=` | `{ jugador, membresia, partidas: [{ juego_nombre }], reservas: [{ mesa, horario, estado }] }` |
| `GET /perfil/lista` | array de nombres de jugador |
| `GET /analitica/juego-mas-jugado` | array de `[{ titulo, complejidad, veces_jugado }]` (no agrupado por complejidad; se muestra como lista) |
| `GET /analitica/membresia-vs-frecuencia` | `[{ plan, total_reservas }]` |
| `GET /analitica/horario-pico` | `[{ hora_del_dia, cantidad_reservas }]` |

### Notas

- **CORS:** los 5 backends deben permitir el origen del frontend (`http://localhost:5173` en local y el dominio de Amplify en producción).
- **Horas:** `horario` se guarda en UTC (ISO con `Z`). Athena agrupa por hora UTC, por lo que el pico puede verse en horas que no corresponden a la zona local.
- **Coherencia:** el Panel Operativo consolida los 5 servicios; si un campo falta, la UI mostrará valores vacíos.

## Desplegar en AWS Amplify

1. Sube este proyecto a un repositorio de GitHub (público, para el entregable).
2. En la consola de AWS Amplify: **New app → Host web app → GitHub**, selecciona el repo y la rama.
3. Amplify detecta Vite automáticamente. Si pide confirmar el build, usa:
   - Comando de build: `npm run build`
   - Directorio de salida: `dist`
4. En **App settings → Environment variables**, agrega `VITE_API_GATEWAY_URL` (y opcionalmente los `VITE_*_URL` por servicio) tal como en `.env.example`.
5. Deploy. Como Amplify sirve el sitio por HTTPS, los backends deben estar también bajo HTTPS (los navegadores bloquean llamadas a `http://` desde una página `https://`).

## Estructura

```
src/
  config.js              # lee las variables de entorno (gateway + overrides por servicio)
  services/
    http.js              # helper fetch compartido (GET/POST/PUT/DELETE)
    catalogoApi.js        # Catálogo
    partidasApi.js         # Partidas
    membresiasApi.js       # Membresías
    perfilApi.js            # Perfil
    analiticaApi.js          # Analítica
    health.js               # healthcheck de los 5 servicios (footer)
  components/            # una vista por servicio + Panel reutilizable + OperativoView
  App.jsx                # navegación entre pestañas + estado compartido
```