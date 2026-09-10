import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, delay } from './http';
import analiticaMock from '../mocks/analitica.json';

const BASE = SERVICE_URLS.analitica;

// GET /analitica/juego-mas-jugado
export async function getJuegoMasJugado() {
  if (USE_MOCKS) {
    await delay(350);
    return analiticaMock.juego_mas_jugado;
  }
  return getJson(`${BASE}/analitica/juego-mas-jugado`);
}

// GET /analitica/membresia-vs-frecuencia
export async function getMembresiaVsFrecuencia() {
  if (USE_MOCKS) {
    await delay(350);
    return analiticaMock.membresia_vs_frecuencia;
  }
  return getJson(`${BASE}/analitica/membresia-vs-frecuencia`);
}

// GET /analitica/horario-pico
export async function getHorarioPico() {
  if (USE_MOCKS) {
    await delay(300);
    return analiticaMock.horario_pico;
  }
  return getJson(`${BASE}/analitica/horario-pico`);
}
