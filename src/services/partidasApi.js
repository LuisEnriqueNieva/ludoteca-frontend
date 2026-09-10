import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, delay } from './http';
import partidasMock from '../mocks/partidas.json';

const BASE = SERVICE_URLS.partidas;

// GET /partidas
export async function getPartidas() {
  if (USE_MOCKS) {
    await delay(300);
    return partidasMock;
  }
  return getJson(`${BASE}/partidas`);
}

// GET /partidas/{id}
export async function getPartidaPorId(id) {
  if (USE_MOCKS) {
    await delay(200);
    const partida = partidasMock.find((p) => p.id === Number(id));
    if (!partida) throw new Error(`Partida ${id} no encontrada (mock)`);
    return partida;
  }
  return getJson(`${BASE}/partidas/${id}`);
}
