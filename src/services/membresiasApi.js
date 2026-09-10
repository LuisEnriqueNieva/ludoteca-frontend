import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, postJson, delay } from './http';
import clientesMock from '../mocks/clientes.json';

const BASE = SERVICE_URLS.membresias;

// GET /clientes
export async function getClientes() {
  if (USE_MOCKS) {
    await delay(300);
    return clientesMock;
  }
  return getJson(`${BASE}/clientes`);
}

// GET /clientes/{id}/reservas
export async function getReservasDeCliente(id) {
  if (USE_MOCKS) {
    await delay(200);
    const cliente = clientesMock.find((c) => c._id === id);
    if (!cliente) throw new Error(`Cliente ${id} no encontrado (mock)`);
    return cliente.reservas;
  }
  return getJson(`${BASE}/clientes/${id}/reservas`);
}

// POST /clientes/{id}/reservas
export async function crearReserva(id, reserva) {
  if (USE_MOCKS) {
    await delay(250);
    const cliente = clientesMock.find((c) => c._id === id);
    if (!cliente) throw new Error(`Cliente ${id} no encontrado (mock)`);
    return { ...reserva, estado: 'confirmada (mock)' };
  }
  return postJson(`${BASE}/clientes/${id}/reservas`, reserva);
}
