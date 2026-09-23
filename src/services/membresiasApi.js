import { SERVICE_URLS } from '../config';
import { getJson, postJson } from './http';

const BASE = SERVICE_URLS.membresias;

// GET /clientes
export function getClientes() {
  return getJson(`${BASE}/clientes`);
}

// GET /clientes/{id}/reservas
export function getReservasDeCliente(id) {
  return getJson(`${BASE}/clientes/${id}/reservas`);
}

// POST /clientes/{id}/reservas
export function crearReserva(id, reserva) {
  return postJson(`${BASE}/clientes/${id}/reservas`, reserva);
}