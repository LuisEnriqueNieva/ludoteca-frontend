import { useEffect, useState } from 'react';
import Panel from './Panel';
import {
  getPartidas,
  getPartidaPorId,
  getPartidasPorJugador,
  crearPartida,
  actualizarPartida,
  eliminarPartida,
} from '../services/partidasApi';

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function parseJugadores(texto) {
  return texto
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
}

const FORM_VACIO = { mesa: '', juego_id: '', fecha: '', resultado: '', jugadores: '' };

export default function PartidasView() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeOk, setMensajeOk] = useState('');

  const [idBuscado, setIdBuscado] = useState('');
  const [detalle, setDetalle] = useState(null);

  const [jugadorFiltro, setJugadorFiltro] = useState('');
  const [partidasFiltradas, setPartidasFiltradas] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState('');

  const [formCrear, setFormCrear] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [formEditar, setFormEditar] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    cargarPartidas();
  }, []);

  async function cargarPartidas() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartidas();
      setPartidas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refrescarListaActual() {
    if (filtroActivo) {
      const data = await getPartidasPorJugador(filtroActivo);
      setPartidasFiltradas(data);
    } else {
      await cargarPartidas();
    }
  }

  async function buscarPartida() {
    if (!idBuscado) return;
    try {
      setError(null);
      const p = await getPartidaPorId(idBuscado);
      setDetalle(p);
    } catch (err) {
      setDetalle(null);
      setError(err.message);
    }
  }

  async function buscarPorJugador() {
    if (!jugadorFiltro) return;
    try {
      setError(null);
      const data = await getPartidasPorJugador(jugadorFiltro);
      setPartidasFiltradas(data);
      setFiltroActivo(jugadorFiltro);
    } catch (err) {
      setError(err.message);
    }
  }

  function limpiarFiltro() {
    setPartidasFiltradas(null);
    setFiltroActivo('');
    setJugadorFiltro('');
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError(null);
    setMensajeOk('');
    try {
      setCreando(true);
      await crearPartida({
        mesa: Number(formCrear.mesa),
        juego_id: Number(formCrear.juego_id),
        fecha: formCrear.fecha,
        resultado: formCrear.resultado,
        jugadores: parseJugadores(formCrear.jugadores),
      });
      setMensajeOk('Partida creada correctamente.');
      setFormCrear(FORM_VACIO);
      await refrescarListaActual();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }

  function iniciarEdicion(p) {
    setEditandoId(p.id);
    setFormEditar({
      mesa: p.mesa,
      juego_id: p.juego_id,
      fecha: (p.fecha || '').slice(0, 10),
      resultado: p.resultado,
      jugadores: '',
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormEditar(FORM_VACIO);
  }

  async function handleActualizar(id) {
    setError(null);
    setMensajeOk('');
    try {
      setGuardando(true);
      await actualizarPartida(id, {
        mesa: Number(formEditar.mesa),
        juego_id: Number(formEditar.juego_id),
        fecha: formEditar.fecha,
        resultado: formEditar.resultado,
      });
      setMensajeOk('Partida actualizada correctamente.');
      cancelarEdicion();
      await refrescarListaActual();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm(`¿Eliminar la partida #${id}?`)) return;
    setError(null);
    setMensajeOk('');
    try {
      setEliminandoId(id);
      await eliminarPartida(id);
      setMensajeOk('Partida eliminada correctamente.');
      await refrescarListaActual();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminandoId(null);
    }
  }

  const listaMostrada = partidasFiltradas ?? partidas.slice(0, 300);

  return (
    <Panel
      title="Partidas jugadas"
      endpoints={[
        'GET /partidas',
        'GET /partidas/{id}',
        'GET /partidas?jugador=',
        'POST /partidas',
        'PUT /partidas/{id}',
        'DELETE /partidas/{id}',
      ]}
    >
      <div className="action-row">
        <input
          className="text-input"
          placeholder="ID de partida, ej. 102"
          value={idBuscado}
          onChange={(e) => setIdBuscado(e.target.value)}
        />
        <button className="action" onClick={buscarPartida}>
          Consultar GET /partidas/{'{id}'}
        </button>
      </div>

      <div className="action-row">
        <input
          className="text-input"
          placeholder="Nombre del jugador, ej. Marta"
          value={jugadorFiltro}
          onChange={(e) => setJugadorFiltro(e.target.value)}
        />
        <button className="action" onClick={buscarPorJugador}>
          Filtrar por jugador
        </button>
        {filtroActivo && (
          <button className="action" onClick={limpiarFiltro}>
            Ver todas
          </button>
        )}
      </div>

      {error && <p className="error-note">{error}</p>}
      {mensajeOk && <p style={{ color: '#2e7d32', margin: '0.5rem 0', fontSize: '0.85rem' }}>{mensajeOk}</p>}

      {detalle && (
        <div className="profile-card" style={{ marginBottom: '1.1rem' }}>
          <h3>Mesa {detalle.mesa}</h3>
          <p style={{ margin: '0 0 0.4rem' }}>
            {formatFecha(detalle.fecha)} · {detalle.resultado}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Jugadores: {(detalle.jugadores || []).join(', ')}
          </p>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem' }}>
            Juego: #{detalle.juego_id}
          </p>
        </div>
      )}

      <form className="action-row" onSubmit={handleCrear} style={{ flexWrap: 'wrap' }}>
        <input
          className="text-input"
          type="number"
          placeholder="Mesa"
          value={formCrear.mesa}
          onChange={(e) => setFormCrear({ ...formCrear, mesa: e.target.value })}
          required
        />
        <input
          className="text-input"
          type="number"
          placeholder="ID del juego"
          value={formCrear.juego_id}
          onChange={(e) => setFormCrear({ ...formCrear, juego_id: e.target.value })}
          required
        />
        <input
          className="text-input"
          type="date"
          value={formCrear.fecha}
          onChange={(e) => setFormCrear({ ...formCrear, fecha: e.target.value })}
          required
        />
        <input
          className="text-input"
          placeholder="Resultado, ej. Ganó Marta"
          value={formCrear.resultado}
          onChange={(e) => setFormCrear({ ...formCrear, resultado: e.target.value })}
          required
        />
        <input
          className="text-input"
          placeholder="Jugadores separados por coma"
          value={formCrear.jugadores}
          onChange={(e) => setFormCrear({ ...formCrear, jugadores: e.target.value })}
          required
        />
        <button className="action" type="submit" disabled={creando}>
          {creando ? 'Creando…' : 'Registrar partida (POST)'}
        </button>
      </form>

      {loading ? (
        <p className="loading-note">Cargando partidas…</p>
      ) : listaMostrada.length === 0 ? (
        <p className="empty-note">
          {filtroActivo ? `${filtroActivo} no tiene partidas registradas.` : 'Todavía no se ha jugado ninguna partida.'}
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaMostrada.map((p) =>
              editandoId === p.id ? (
                <tr key={p.id}>
                  <td>
                    <input
                      className="text-input"
                      type="number"
                      value={formEditar.mesa}
                      onChange={(e) => setFormEditar({ ...formEditar, mesa: e.target.value })}
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>
                    <input
                      className="text-input"
                      type="date"
                      value={formEditar.fecha}
                      onChange={(e) => setFormEditar({ ...formEditar, fecha: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="text-input"
                      value={formEditar.resultado}
                      onChange={(e) => setFormEditar({ ...formEditar, resultado: e.target.value })}
                    />
                  </td>
                  <td>
                    <button className="action" disabled={guardando} onClick={() => handleActualizar(p.id)}>
                      {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button className="action" onClick={cancelarEdicion} style={{ marginLeft: '0.4rem' }}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td>{p.mesa}</td>
                  <td>{formatFecha(p.fecha)}</td>
                  <td>{p.resultado}</td>
                  <td>
                    <button className="action" onClick={() => iniciarEdicion(p)}>
                      Editar
                    </button>
                    <button
                      className="action"
                      disabled={eliminandoId === p.id}
                      onClick={() => handleEliminar(p.id)}
                      style={{ marginLeft: '0.4rem' }}
                    >
                      {eliminandoId === p.id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </Panel>
  );
}