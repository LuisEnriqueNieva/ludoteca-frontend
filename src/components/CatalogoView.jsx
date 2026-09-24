import { useEffect, useState } from 'react';
import Panel from './Panel';
import Combobox from './Combobox';
import Paginador from './Paginador';
import {
  getJuegos,
  getEditoriales,
  getJuegoPorId,
  getEditorialPorId,
  crearJuego,
  actualizarJuego,
  eliminarJuego,
} from '../services/catalogoApi';

const TAMANO_PAGINA = 20;
const COMPLEJIDADES = ['Baja', 'Media', 'Alta'];
const FORM_VACIO = {
  titulo: '',
  genero: '',
  complejidad: 'Baja',
  jugadores_min: '',
  jugadores_max: '',
  editorial: '',
};

function tituloLimpio(juego) {
  return (juego?.titulo ?? '').replace(/[#\s]*\d+$/, '').trim();
}

export default function CatalogoView() {
  const [juegos, setJuegos] = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [seleccionId, setSeleccionId] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);

  const [formCrear, setFormCrear] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [formEditar, setFormEditar] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    Promise.all([getJuegos(), getEditoriales()])
      .then(([j, e]) => {
        if (!vivo) return;
        setJuegos(j);
        setEditoriales(e);
        setError(null);
      })
      .catch((err) => vivo && setError(err.message))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [juegos, busquedaNombre]);

  const nombreEditorial = (id) => editoriales.find((e) => e.id === id)?.nombre ?? `#${id}`;

  const filtro = busquedaNombre.trim().toLowerCase();
  const juegosFiltrados = filtro
    ? juegos.filter((j) => j.titulo.toLowerCase().includes(filtro))
    : juegos;
  const totalPaginas = Math.ceil(juegosFiltrados.length / TAMANO_PAGINA);
  const paginaActual = Math.min(pagina, Math.max(1, totalPaginas));
  const inicio = (paginaActual - 1) * TAMANO_PAGINA;
  const juegosPagina = juegosFiltrados.slice(inicio, inicio + TAMANO_PAGINA);

  function resolverEditorial(valor) {
    const limpio = String(valor).trim();
    if (/^\d+$/.test(limpio)) {
      return editoriales.find((e) => e.id === Number(limpio)) ?? null;
    }
    return editoriales.find((e) => e.nombre.toLowerCase() === limpio.toLowerCase()) ?? null;
  }

  async function recargarJuegos() {
    const data = await getJuegos();
    setJuegos(data);
  }

  async function consultarDetalle() {
    if (!seleccionId) return;
    try {
      setError(null);
      const j = await getJuegoPorId(seleccionId);
      let editorial = null;
      try {
        editorial = await getEditorialPorId(j.editorial_id);
      } catch {
        editorial = null;
      }
      setDetalle({ ...j, editorial });
    } catch (err) {
      setDetalle(null);
      setError(err.message);
    }
  }

  function validarForm(form) {
    const minimos = Number(form.jugadores_min);
    const maximos = Number(form.jugadores_max);
    if (!form.titulo.trim() || !form.genero.trim()) return 'Completa el título y el género.';
    if (!Number.isFinite(minimos) || !Number.isFinite(maximos) || minimos < 1 || maximos < 1 || maximos < minimos) {
      return 'Jugadores inválidos (mínimo ≥ 1 y máximo ≥ mínimo).';
    }
    if (!resolverEditorial(form.editorial)) {
      return `No se encontró la editorial "${form.editorial}". Usa su ID o su nombre exacto.`;
    }
    return null;
  }

  function payloadJuego(form) {
    return {
      titulo: form.titulo.trim(),
      genero: form.genero.trim(),
      complejidad: form.complejidad,
      jugadores_min: Number(form.jugadores_min),
      jugadores_max: Number(form.jugadores_max),
      editorial_id: resolverEditorial(form.editorial).id,
    };
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError(null);
    const invalido = validarForm(formCrear);
    if (invalido) {
      setError(invalido);
      return;
    }
    try {
      setCreando(true);
      await crearJuego(payloadJuego(formCrear));
      setFormCrear(FORM_VACIO);
      await recargarJuegos();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }

  function iniciarEdicion(j) {
    setEditandoId(j.id);
    setFormEditar({
      titulo: j.titulo,
      genero: j.genero,
      complejidad: j.complejidad,
      jugadores_min: j.jugadores_min,
      jugadores_max: j.jugadores_max,
      editorial: j.editorial_id,
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormEditar(FORM_VACIO);
  }

  async function handleActualizar() {
    setError(null);
    const invalido = validarForm(formEditar);
    if (invalido) {
      setError(invalido);
      return;
    }
    try {
      setGuardando(true);
      await actualizarJuego(editandoId, payloadJuego(formEditar));
      cancelarEdicion();
      await recargarJuegos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm(`¿Eliminar el juego #${id}?`)) return;
    setError(null);
    try {
      setEliminandoId(id);
      await eliminarJuego(id);
      await recargarJuegos();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminandoId(null);
    }
  }

  const itemsEditorial = editoriales.map((e) => e.nombre);

  return (
    <Panel title="Catálogo de juegos de mesa">
      <div className="action-row">
        <input
          className="text-input"
          placeholder="Buscar por nombre, ej. Catan"
          value={busquedaNombre}
          onChange={(e) => setBusquedaNombre(e.target.value)}
        />
        <input
          className="text-input"
          placeholder="ID de juego, ej. 3"
          value={seleccionId}
          onChange={(e) => setSeleccionId(e.target.value)}
        />
        <button className="action" onClick={consultarDetalle}>
          Consultar detalle
        </button>
      </div>

      {error && <p className="error-note">{error}</p>}

      {detalle && (
        <div className="profile-card" style={{ marginBottom: '1.1rem' }}>
          <h3>{tituloLimpio(detalle)}</h3>
          <p style={{ margin: 0 }}>
            {detalle.genero} · complejidad {detalle.complejidad} · {detalle.jugadores_min}-
            {detalle.jugadores_max} jugadores · editorial:{' '}
            {detalle.editorial
              ? `${detalle.editorial.nombre} (${detalle.editorial.pais})`
              : nombreEditorial(detalle.editorial_id)}
          </p>
        </div>
      )}

      {editandoId && (
        <div className="profile-card" style={{ marginBottom: '1.1rem', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.7rem' }}>Editar juego #{editandoId}</h3>
          <div className="action-row" style={{ flexWrap: 'wrap' }}>
            <input
              className="text-input"
              placeholder="Título"
              value={formEditar.titulo}
              onChange={(e) => setFormEditar({ ...formEditar, titulo: e.target.value })}
            />
            <input
              className="text-input"
              placeholder="Género"
              value={formEditar.genero}
              onChange={(e) => setFormEditar({ ...formEditar, genero: e.target.value })}
            />
            <select
              className="text-input"
              value={formEditar.complejidad}
              onChange={(e) => setFormEditar({ ...formEditar, complejidad: e.target.value })}
            >
              {COMPLEJIDADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="text-input"
              type="number"
              placeholder="Mín jugadores"
              value={formEditar.jugadores_min}
              onChange={(e) => setFormEditar({ ...formEditar, jugadores_min: e.target.value })}
              style={{ width: '110px' }}
            />
            <input
              className="text-input"
              type="number"
              placeholder="Máx jugadores"
              value={formEditar.jugadores_max}
              onChange={(e) => setFormEditar({ ...formEditar, jugadores_max: e.target.value })}
              style={{ width: '110px' }}
            />
            <Combobox
              items={itemsEditorial}
              value={formEditar.editorial}
              onChange={(v) => setFormEditar({ ...formEditar, editorial: v })}
              placeholder="Editorial (nombre o ID)"
            />
            <button className="action" disabled={guardando} onClick={handleActualizar}>
              {guardando ? 'Guardando…' : 'Guardar (PUT)'}
            </button>
            <button className="action" onClick={cancelarEdicion}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <form className="action-row" onSubmit={handleCrear} style={{ flexWrap: 'wrap' }}>
        <input
          className="text-input"
          placeholder="Título del juego"
          value={formCrear.titulo}
          onChange={(e) => setFormCrear({ ...formCrear, titulo: e.target.value })}
        />
        <input
          className="text-input"
          placeholder="Género"
          value={formCrear.genero}
          onChange={(e) => setFormCrear({ ...formCrear, genero: e.target.value })}
        />
        <select
          className="text-input"
          value={formCrear.complejidad}
          onChange={(e) => setFormCrear({ ...formCrear, complejidad: e.target.value })}
        >
          {COMPLEJIDADES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="text-input"
          type="number"
          placeholder="Mín jugadores"
          value={formCrear.jugadores_min}
          onChange={(e) => setFormCrear({ ...formCrear, jugadores_min: e.target.value })}
          style={{ width: '110px' }}
        />
        <input
          className="text-input"
          type="number"
          placeholder="Máx jugadores"
          value={formCrear.jugadores_max}
          onChange={(e) => setFormCrear({ ...formCrear, jugadores_max: e.target.value })}
          style={{ width: '110px' }}
        />
        <Combobox
          items={itemsEditorial}
          value={formCrear.editorial}
          onChange={(v) => setFormCrear({ ...formCrear, editorial: v })}
          placeholder="Editorial (nombre o ID)"
        />
        <button className="action" type="submit" disabled={creando}>
          {creando ? 'Creando…' : 'Registrar juego (POST)'}
        </button>
      </form>

      {loading ? (
        <p className="loading-note">Cargando catálogo…</p>
      ) : juegosFiltrados.length === 0 ? (
        <p className="empty-note">No hay juegos que coincidan con "{busquedaNombre}".</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Género</th>
              <th>Complejidad</th>
              <th>Jugadores</th>
              <th>Editorial</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {juegosPagina.map((j) => (
              <tr key={j.id}>
                <td>{tituloLimpio(j)}</td>
                <td>{j.genero}</td>
                <td>{j.complejidad}</td>
                <td>
                  {j.jugadores_min}-{j.jugadores_max}
                </td>
                <td>{nombreEditorial(j.editorial_id)}</td>
                <td>
                  <button className="action" onClick={() => iniciarEdicion(j)}>
                    Editar
                  </button>
                  <button
                    className="action"
                    disabled={eliminandoId === j.id}
                    onClick={() => handleEliminar(j.id)}
                    style={{ marginLeft: '0.4rem' }}
                  >
                    {eliminandoId === j.id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Paginador
        total={juegosFiltrados.length}
        pagina={paginaActual}
        tamano={TAMANO_PAGINA}
        onCambioPagina={setPagina}
      />
    </Panel>
  );
}