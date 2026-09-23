import { SERVICE_URLS } from '../config';
import { getJson } from './http';

const BASE = SERVICE_URLS.analitica;

// GET /analitica/juego-mas-jugado
export function getJuegoMasJugado() {
  return getJson(`${BASE}/analitica/juego-mas-jugado`);
}

// GET /analitica/membresia-vs-frecuencia
export function getMembresiaVsFrecuencia() {
  return getJson(`${BASE}/analitica/membresia-vs-frecuencia`);
}

// GET /analitica/horario-pico
export function getHorarioPico() {
  return getJson(`${BASE}/analitica/horario-pico`);
}