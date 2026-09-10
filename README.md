# La Ludoteca — Frontend

Panel web (React + Vite) que consume los 5 microservicios del proyecto **Ludoteca / Red de Cafés de Juegos de Mesa**. Cada microservicio tiene su propia "mesa" en la interfaz, con al menos 2 métodos REST invocados.

## Estado actual: modo mock

Como el resto de microservicios todavía se están construyendo, el frontend arranca con `VITE_USE_MOCKS=true`, que sirve datos simulados con **exactamente la misma forma** de lo que devolverán los backends reales. Esto permite:

- Avanzar el frontend sin depender de que los demás terminen.
- Desplegar ya mismo en Amplify.
- Cambiar a datos reales solo tocando variables de entorno, sin tocar código.

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

## Microservicios y endpoints usados

| # | Microservicio | Archivo de servicio | Endpoints consumidos |
|---|---|---|---|
| 1 | Catálogo de juegos (Python/MySQL, :8001) | `src/services/catalogoApi.js` | `GET /juegos`, `GET /juegos/{id}`, `GET /editoriales` |
| 2 | Partidas jugadas (Java/PostgreSQL, :8002) | `src/services/partidasApi.js` | `GET /partidas`, `GET /partidas/{id}` |
| 3 | Membresías y reservas (Node/MongoDB, :8003) | `src/services/membresiasApi.js` | `GET /clientes`, `GET /clientes/{id}/reservas`, `POST /clientes/{id}/reservas` |
| 4 | Perfil de jugador — agregador (:8004) | `src/services/perfilApi.js` | `GET /perfil/{nombre}` |
| 5 | Analítico / Athena (Python, :8005) | `src/services/analiticaApi.js` | `GET /analitica/juego-mas-jugado`, `GET /analitica/membresia-vs-frecuencia`, `GET /analitica/horario-pico` |

## Ejecutar en local

```bash
npm install
cp .env.example .env.local   # deja VITE_USE_MOCKS=true mientras el backend no esté listo
npm run dev
```

## Pasar a microservicios reales

Cuando cada backend esté desplegado, en `.env.local` (o en las variables de entorno de Amplify):

```
VITE_USE_MOCKS=false
VITE_CATALOGO_URL=https://tu-url-ms1
VITE_PARTIDAS_URL=https://tu-url-ms2
VITE_MEMBRESIAS_URL=https://tu-url-ms3
VITE_PERFIL_URL=https://tu-url-ms4
VITE_ANALITICA_URL=https://tu-url-ms5
```

No hace falta cambiar ningún componente: cada archivo en `src/services/` decide solo, según `VITE_USE_MOCKS`, si responde con datos simulados o llama al backend real.

### Formas de datos que el frontend espera

Verificar que cada backend devuelva **exactamente** estas formas (los mocks en `src/mocks/` las replican):

| MS | Endpoint | Respuesta esperada |
|---|---|---|
| 1 | `GET /juegos` | `[{ id, titulo, genero, complejidad, jugadores_min, jugadores_max, editorial_id }]` |
| 1 | `GET /juegos/{id}` | un objeto `juego` como el anterior |
| 1 | `GET /editoriales` | `[{ id, nombre }]` |
| 2 | `GET /partidas` | `[{ id, mesa, juego_id, fecha, resultado, partida_jugadores: [{ id, nombre_jugador }] }]` |
| 2 | `GET /partidas/{id}` | una `partida` como la anterior |
| 3 | `GET /clientes` | `[{ _id, nombre, plan, reservas: [{ mesa, horario, estado }] }]` (se usa `_id`, es MongoDB) |
| 3 | `GET /clientes/{id}/reservas` | array de `reservas` |
| 3 | `POST /clientes/{id}/reservas` | recibe `{ mesa, horario, estado }`, devuelve la reserva creada |
| 4 | `GET /perfil/{nombre}` | `{ nombre_jugador, partidas_totales, membresia, proximas_reservas: [...], juegos_jugados: [...] }` |
| 5 | `GET /analitica/juego-mas-jugado` | `{ por_complejidad: [{ complejidad, juego, veces_jugado }] }` |
| 5 | `GET /analitica/membresia-vs-frecuencia` | `[{ plan, visitas_promedio_mes }]` |
| 5 | `GET /analitica/horario-pico` | `[{ horario, reservas }]` |

### Notas para pasar a reales

- **CORS:** los 5 backends deben permitir el origen del frontend (`http://localhost:5173` en local y el dominio de Amplify en producción).
- **Rebuild obligatorio:** las variables `VITE_*` se hornean en el build de Vite. Tras cambiarlas hay que recompilar (`npm run build`) o redeployar en Amplify.
- **Coherencia:** el panel operativo consolida datos de MS1–3 + MS5; si un campo falta (p. ej. `reservas` o `partida_jugadores`), la UI mostrará valores vacíos. Valida las formas de arriba antes de desplegar.

## Desplegar en AWS Amplify

1. Sube este proyecto a un repositorio de GitHub (público, para el entregable).
2. En la consola de AWS Amplify: **New app → Host web app → GitHub**, selecciona el repo y la rama.
3. Amplify detecta Vite automáticamente. Si pide confirmar el build, usa:
   - Comando de build: `npm run build`
   - Directorio de salida: `dist`
4. En **App settings → Environment variables**, agrega las mismas variables de `.env.example` (empiezan mientras tanto en modo mock).
5. Deploy. Cuando los microservicios reales estén arriba (idealmente con HTTPS, porque Amplify sirve el sitio por HTTPS y los navegadores bloquean llamadas a `http://` desde una página `https://`), actualiza esas variables y vuelve a desplegar (o activa "Redeploy this version").

## Estructura

```
src/
  config.js              # lee las variables de entorno (USE_MOCKS + URLs)
  services/
    http.js              # helper fetch compartido
    catalogoApi.js        # MS1
    partidasApi.js         # MS2
    membresiasApi.js       # MS3
    perfilApi.js            # MS4
    analiticaApi.js          # MS5
  mocks/                 # JSON con la forma real de cada respuesta
  components/            # una vista por microservicio + Panel reutilizable
  App.jsx                # navegación entre las 5 "mesas"
```
