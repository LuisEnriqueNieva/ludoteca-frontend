import { SERVICE_URLS } from '../config';
import { getJson } from './http';

const BASE = SERVICE_URLS.perfil;

export function getPerfilJugador(nombre) {
  return getJson(`${BASE}/perfil?nombre_jugador=${encodeURIComponent(nombre)}`);
}

export function getListaClientes() {
  return getJson(`${BASE}/perfil/lista`);
}