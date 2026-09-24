import { SERVICE_URLS } from '../config';
import { getJson, postJson, putJson, deleteJson } from './http';

const BASE = SERVICE_URLS.catalogo;

// GET /juegos
export function getJuegos() {
  return getJson(`${BASE}/juegos`);
}

// GET /juegos/{id}
export function getJuegoPorId(id) {
  return getJson(`${BASE}/juegos/${id}`);
}

// POST /juegos
export function crearJuego(juego) {
  return postJson(`${BASE}/juegos`, juego);
}

// PUT /juegos/{id}
export function actualizarJuego(id, juego) {
  return putJson(`${BASE}/juegos/${id}`, juego);
}

// DELETE /juegos/{id}
export function eliminarJuego(id) {
  return deleteJson(`${BASE}/juegos/${id}`);
}

// GET /editoriales
export function getEditoriales() {
  return getJson(`${BASE}/editoriales`);
}

// GET /editoriales/{id}
export function getEditorialPorId(id) {
  return getJson(`${BASE}/editoriales/${id}`);
}