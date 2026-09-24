import { useEffect, useState } from 'react';
import Panel from './Panel';
import Paginador from './Paginador';
import { getJuegos, getEditoriales, getJuegoPorId } from '../services/catalogoApi';
import { SERVICE_URLS } from '../config';

const TAMANO_PAGINA = 20;

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

  async function consultarDetalle() {
    if (!seleccionId) return;
    try {
      setError(null);
      const j = await getJuegoPorId(seleccionId);
      setDetalle(j);
    } catch (err) {
      setDetalle(null);
      setError(err.message);
    }
  }

  return (
    <Panel
      title="Catálogo de juegos de mesa"
    >
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
            {detalle.jugadores_max} jugadores · editorial: {nombreEditorial(detalle.editorial_id)}
          </p>
        </div>
      )}

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
