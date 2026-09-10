import { USE_MOCKS, SERVICE_URLS } from '../config';
import { getJson, delay } from './http';
import partidasMock from '../mocks/partidas.json';
import juegosMock from '../mocks/juegos.json';
import clientesMock from '../mocks/clientes.json';

const BASE = SERVICE_URLS.perfil;

// GET /perfil/{nombre_jugador}
// La spec del MS4 solo define este endpoint (arma la ficha combinando MS1+MS2+MS3).
export async function getPerfilJugador(nombre) {
  if (USE_MOCKS) {
    await delay(400);
    const partidasDelJugador = partidasMock.filter((p) =>
      p.partida_jugadores.some((j) => j.nombre_jugador === nombre)
    );
    const juegosJugados = partidasDelJugador.map((p) => {
      const juego = juegosMock.find((j) => j.id === p.juego_id);
      return juego ? juego.titulo : `Juego #${p.juego_id}`;
    });
    const cliente = clientesMock.find((c) => c.nombre === nombre);
    if (!cliente && partidasDelJugador.length === 0) {
      throw new Error(`No se encontró información de "${nombre}" (mock)`);
    }
    return {
      nombre_jugador: nombre,
      juegos_jugados: [...new Set(juegosJugados)],
      partidas_totales: partidasDelJugador.length,
      membresia: cliente ? cliente.plan : 'sin membresía registrada',
      proximas_reservas: cliente ? cliente.reservas : [],
    };
  }
  return getJson(`${BASE}/perfil/${encodeURIComponent(nombre)}`);
}
