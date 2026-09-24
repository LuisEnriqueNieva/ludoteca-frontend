import axios from 'axios';
import { SERVICE_URLS } from '../config';

// Ping ligero por microservicio (endpoints pequeños) para reportar
// servicios que responden a través del gateway. Un error de red/CORS
// se considera servicio caído.
const CHECKS = [
  { id: 'catalogo', nombre: 'Catálogo', url: `${SERVICE_URLS.catalogo}/editoriales` },
  { id: 'partidas', nombre: 'Partidas', url: `${SERVICE_URLS.partidas}/partidas?jugador=healthcheck` },
  { id: 'membresias', nombre: 'Reservas', url: `${SERVICE_URLS.membresias}/clientes/000000000000000000000000/reservas` },
  { id: 'perfil', nombre: 'Clientes', url: `${SERVICE_URLS.perfil}/perfil?nombre_jugador=healthcheck` },
  { id: 'analitica', nombre: 'Analítica', url: `${SERVICE_URLS.analitica}/analitica/horario-pico` },
];

async function ping(url) {
  try {
    await axios.get(url, { timeout: 8000 });
    return true;
  } catch (error) {
    return error.response == null || error.response.status < 500;
  }
}

export async function getServiciosSaludables() {
  const servicios = await Promise.all(
    CHECKS.map(async (c) => ({ ...c, ok: await ping(c.url) }))
  );
  return {
    total: servicios.length,
    ok: servicios.filter((s) => s.ok).length,
    servicios,
  };
}