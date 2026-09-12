import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, delay } from './http';
import partidasMock from '../mocks/partidas.json';
import juegosMock from '../mocks/juegos.json';
import clientesMock from '../mocks/clientes.json';

const BASE = SERVICE_URLS.perfil;

export async function getPerfilJugador(nombre) {
  if (USE_MOCKS) {
    await delay(400);
    const partidasDelJugador = partidasMock.filter((p) =>
      (p.jugadores || []).includes(nombre)
    );
    const partidas = partidasDelJugador.map((p) => {
      const juego = juegosMock.find((j) => j.id === p.juego_id);
      return {
        id: p.id,
        juego_id: p.juego_id,
        fecha: p.fecha,
        resultado: p.resultado,
        juego_nombre: juego ? juego.titulo : `Juego #${p.juego_id}`,
      };
    });
    const cliente = clientesMock.find((c) => c.nombre === nombre);
    if (!cliente && partidasDelJugador.length === 0) {
      throw new Error(`No se encontró información de "${nombre}" (mock)`);
    }
    return {
      jugador: nombre,
      membresia: cliente ? cliente.plan : 'sin membresía registrada',
      reservas: cliente ? cliente.reservas : [],
      partidas,
    };
  }
  return getJson(`${BASE}/perfil?nombre_jugador=${encodeURIComponent(nombre)}`);
}

export async function getListaClientes() {
  if (USE_MOCKS) {
    await delay(150);
    return clientesMock.map((c) => c.nombre);
  }
  return getJson(`${BASE}/perfil/lista`);
}