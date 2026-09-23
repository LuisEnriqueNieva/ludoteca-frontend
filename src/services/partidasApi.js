import { SERVICE_URLS } from '../config';
import { getJson, postJson, putJson, deleteJson } from './http';

const BASE = SERVICE_URLS.partidas;

export function getPartidas() {
  return getJson(`${BASE}/partidas`);
}

export function getPartidaPorId(id) {
  return getJson(`${BASE}/partidas/${id}`);
}

export function getPartidasPorJugador(nombreJugador) {
  return getJson(`${BASE}/partidas?jugador=${encodeURIComponent(nombreJugador)}`);
}

export function crearPartida(partida) {
  return postJson(`${BASE}/partidas`, partida);
}

export function actualizarPartida(id, partida) {
  return putJson(`${BASE}/partidas/${id}`, partida);
}

export function eliminarPartida(id) {
  return deleteJson(`${BASE}/partidas/${id}`);
}