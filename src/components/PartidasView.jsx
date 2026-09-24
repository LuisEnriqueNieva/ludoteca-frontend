import { useEffect, useState } from 'react';
import Panel from './Panel';
import Combobox from './Combobox';
import Paginador from './Paginador';
import { getPartidas,
  getPartidaPorId,
  getPartidasPorJugador,
  crearPartida,
  actualizarPartida,
  eliminarPartida,
} from '../services/partidasApi';
import { getJuegos } from '../services/catalogoApi';
import { getListaClientes } from '../services/perfilApi';
import { formatFecha } from '../services/format';

const FORM_VACIO = { mesa: '', juego_id: '', fecha: '', resultado: '', jugadores: ['', ''] };
const MESAS = Array.from({ length: 20 }, (_, i) => String(i + 1));
const TAMANO_PAGINA = 20;

export default function PartidasView({ partidaInicial }) {
  const [partidas, setPartidas] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeOk, setMensajeOk] = useState('');

  const [idBuscado, setIdBuscado] = useState('');
  const [detalle, setDetalle] = useState(null);

  const [jugadorFiltro, setJugadorFiltro] = useState('');
  const [partidasFiltradas, setPartidasFiltradas] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState('');
  const [pagina, setPagina] = useState(1);

  const [formCrear, setFormCrear] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [formEditar, setFormEditar] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    cargarPartidas();
  }, []);

  useEffect(() => {
    getJuegos().then(setJuegos).catch(() => {});
  }, []);

  useEffect(() => {
    getListaClientes().then(setJugadoresDisponibles).catch(() => {});
  }, []);

  useEffect(() => {
    if (!partidaInicial) return;
    setIdBuscado(String(partidaInicial));
    getPartidaPorId(partidaInicial)
      .then((p) => {
        setDetalle(p);
        setError(null);
      })
      .catch((err) => {
        setDetalle(null);
        setError(err.message);
      });
  }, [partidaInicial]);

  useEffect(() => {
    setPagina(1);
  }, [partidas, partidasFiltradas]);

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

  function resolverJuego(valor) {
    const limpio = String(valor).trim();
    if (/^\d+$/.test(limpio)) return juegos.find((j) => j.id === Number(limpio)) ?? null;
    return juegos.find((j) => j.titulo.toLowerCase() === limpio.toLowerCase()) ?? null;
  }

  function resolverJuegoId(valor) {
    return resolverJuego(valor)?.id ?? null;
  }

  const juegoCrear = resolverJuego(formCrear.juego_id);
  const minJugadores = Math.max(2, Number(juegoCrear?.jugadores_min) || 2);
  const maxJugadores = Number(juegoCrear?.jugadores_max) || Infinity;
  const jugadoresLlenos = (formCrear.jugadores || []).map((s) => s.trim()).filter(Boolean);

  function onJuegoChange(valor) {
    const juego = resolverJuego(valor);
    setFormCrear((prev) => {
      if (!juego) return { ...prev, juego_id: valor };
      const nuevoMin = Math.max(2, Number(juego.jugadores_min) || 2);
      const actual = Array.isArray(prev.jugadores) ? prev.jugadores : ['', ''];
      const jugadores =
        actual.length === nuevoMin
          ? actual
          : Array.from({ length: nuevoMin }, (_, i) => actual[i] ?? '');
      return { ...prev, juego_id: valor, jugadores };
    });
  }

  function cambiarJugador(i, v) {
    setFormCrear((prev) => {
      const jugadores = [...(prev.jugadores || ['', ''])];
      jugadores[i] = v;
      return { ...prev, jugadores };
    });
  }

  function agregarJugador() {
    setFormCrear((prev) => ({ ...prev, jugadores: [...(prev.jugadores || ['', '']), ''] }));
  }

  function quitarJugador(i) {
    setFormCrear((prev) => ({
      ...prev,
      jugadores: (prev.jugadores || ['', '']).filter((_, j) => j !== i),
    }));
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError(null);
    setMensajeOk('');
    if (!formCrear.mesa.trim()) {
      setError('Completa la mesa.');
      return;
    }
    if (!formCrear.resultado.trim()) {
      setError('Completa el resultado de la partida.');
      return;
    }
    const juego = resolverJuego(formCrear.juego_id);
    if (!juego) {
      setError(`No se encontró el juego "${formCrear.juego_id}". Usa su ID o su nombre exacto.`);
      return;
    }
    const min = Math.max(2, Number(juego.jugadores_min) || 2);
    const max = Number(juego.jugadores_max) || Infinity;
    if (jugadoresLlenos.length < min) {
      setError(`Este juego necesita al menos ${min} jugadores (escribe todos los huecos).`);
      return;
    }
    if (jugadoresLlenos.length > max) {
      setError(`Este juego permite como máximo ${max} jugadores.`);
      return;
    }
    const unicos = new Set(jugadoresLlenos.map((n) => n.toLowerCase()));
    if (unicos.size !== jugadoresLlenos.length) {
      setError('No se puede repetir a la misma persona como jugador.');
      return;
    }
    const juegoId = resolverJuegoId(formCrear.juego_id);
    try {
      setCreando(true);
      await crearPartida({
        mesa: Number(formCrear.mesa),
        juego_id: juegoId,
        fecha: formCrear.fecha,
        resultado: formCrear.resultado,
        jugadores: jugadoresLlenos,
      });
      setMensajeOk('Partida creada correctamente.');
      setFormCrear({ ...FORM_VACIO });
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

  const listaCompleta = partidasFiltradas ?? partidas;
  const totalPaginas = Math.ceil(listaCompleta.length / TAMANO_PAGINA);
  const paginaActual = Math.min(pagina, Math.max(1, totalPaginas));
  const inicio = (paginaActual - 1) * TAMANO_PAGINA;
  const listaMostrada = listaCompleta.slice(inicio, inicio + TAMANO_PAGINA);

  return (
    <Panel
      title="Partidas jugadas"
    >
      <div className="action-row">
        <input
          className="text-input"
          placeholder="ID de partida, ej. 102"
          value={idBuscado}
          onChange={(e) => setIdBuscado(e.target.value)}
        />
        <button className="action" onClick={buscarPartida}>
          Consultar detalle
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
        <Combobox
          items={MESAS}
          value={formCrear.mesa}
          onChange={(v) => setFormCrear({ ...formCrear, mesa: v })}
          placeholder="Mesa"
        />
        <Combobox
          items={juegos.map((j) => j.titulo)}
          value={formCrear.juego_id}
          onChange={onJuegoChange}
          placeholder="ID o nombre del juego"
        />
        <input
          className="text-input"
          type="date"
          value={formCrear.fecha}
          onChange={(e) => setFormCrear({ ...formCrear, fecha: e.target.value })}
          required
        />
        <Combobox
          items={jugadoresLlenos}
          value={formCrear.resultado}
          onChange={(v) => setFormCrear({ ...formCrear, resultado: v })}
          placeholder={jugadoresLlenos.length > 0 ? `Resultado, ej. Ganó ${jugadoresLlenos[0]}` : 'Resultado'}
        />
        {(formCrear.jugadores || ['', '']).map((jugador, i) => {
          const otros = (formCrear.jugadores || []).filter((_, j) => j !== i);
          return (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <Combobox
                items={jugadoresDisponibles}
                value={jugador}
                onChange={(v) => cambiarJugador(i, v)}
                placeholder={`Jugador ${i + 1}`}
                exclude={otros}
              />
              {formCrear.jugadores.length > minJugadores && (
                <button type="button" className="action" onClick={() => quitarJugador(i)}>
                  Quitar
                </button>
              )}
            </div>
          );
        })}
        {formCrear.jugadores.length < maxJugadores && (
          <button type="button" className="action" onClick={agregarJugador}>
            + Agregar jugador
          </button>
        )}
        {juegoCrear && (
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
            {minJugadores}-{maxJugadores === Infinity ? '?' : maxJugadores} jugadores
          </span>
        )}
        {jugadoresLlenos.length > 0 &&
          new Set(jugadoresLlenos.map((n) => n.toLowerCase())).size !== jugadoresLlenos.length && (
            <p style={{ color: '#b3261e', margin: '0.2rem 0', fontSize: '0.85rem', width: '100%' }}>
              No puedes repetir al mismo jugador en una partida.
            </p>
          )}
        <button className="action" type="submit" disabled={creando}>
          {creando ? 'Creando…' : 'Registrar partida (POST)'}
        </button>
      </form>

      {loading ? (
        <p className="loading-note">Cargando partidas…</p>
      ) : listaCompleta.length === 0 ? (
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
      <Paginador
        total={listaCompleta.length}
        pagina={paginaActual}
        tamano={TAMANO_PAGINA}
        onCambioPagina={setPagina}
      />
    </Panel>
  );
}