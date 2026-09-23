import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, postJson, putJson, deleteJson, delay } from './http';
import partidasMock from '../mocks/partidas.json';

const BASE = SERVICE_URLS.partidas;

export async function getPartidas() {
  if (USE_MOCKS) {
    await delay(300);
    return partidasMock.map(({ jugadores, ...partida }) => partida);
  }
  return getJson(`${BASE}/partidas`);
}

export async function getPartidaPorId(id) {
  if (USE_MOCKS) {
    await delay(200);
    const partida = partidasMock.find((p) => p.id === Number(id));
    if (!partida) throw new Error(`Partida ${id} no encontrada (mock)`);
    return { ...partida, jugadores: partida.jugadores || [] };
  }
  return getJson(`${BASE}/partidas/${id}`);
}

export async function getPartidasPorJugador(nombreJugador) {
  if (USE_MOCKS) {
    await delay(250);
    return partidasMock.filter((p) => (p.jugadores || []).includes(nombreJugador));
  }
  return getJson(`${BASE}/partidas?jugador=${encodeURIComponent(nombreJugador)}`);
}

export async function crearPartida(partida) {
  if (USE_MOCKS) {
    await delay(300);
    return { id: Math.floor(Math.random() * 100000), mensaje: 'Partida creada correctamente (mock)' };
  }
  return postJson(`${BASE}/partidas`, partida);
}

export async function actualizarPartida(id, partida) {
  if (USE_MOCKS) {
    await delay(300);
    return { mensaje: 'Partida actualizada correctamente (mock)' };
  }
  return putJson(`${BASE}/partidas/${id}`, partida);
}

export async function eliminarPartida(id) {
  if (USE_MOCKS) {
    await delay(250);
    return { mensaje: 'Partida eliminada correctamente (mock)' };
  }
  return deleteJson(`${BASE}/partidas/${id}`);
}