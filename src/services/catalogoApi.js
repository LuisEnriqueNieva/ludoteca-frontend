import { SERVICE_URLS } from '../config';
import { getJson } from './http';

const BASE = SERVICE_URLS.catalogo;

// GET /juegos
export function getJuegos() {
  return getJson(`${BASE}/juegos`);
}

// GET /juegos/{id}
export function getJuegoPorId(id) {
  return getJson(`${BASE}/juegos/${id}`);
}

// GET /editoriales
export function getEditoriales() {
  return getJson(`${BASE}/editoriales`);
}