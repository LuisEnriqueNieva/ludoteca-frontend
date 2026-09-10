import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, delay } from './http';
import juegosMock from '../mocks/juegos.json';
import editorialesMock from '../mocks/editoriales.json';

const BASE = SERVICE_URLS.catalogo;

// GET /juegos
export async function getJuegos() {
  if (USE_MOCKS) {
    await delay(300);
    return juegosMock;
  }
  return getJson(`${BASE}/juegos`);
}

// GET /juegos/{id}
export async function getJuegoPorId(id) {
  if (USE_MOCKS) {
    await delay(200);
    const juego = juegosMock.find((j) => j.id === Number(id));
    if (!juego) throw new Error(`Juego ${id} no encontrado (mock)`);
    return juego;
  }
  return getJson(`${BASE}/juegos/${id}`);
}

// GET /editoriales
export async function getEditoriales() {
  if (USE_MOCKS) {
    await delay(250);
    return editorialesMock;
  }
  return getJson(`${BASE}/editoriales`);
}
