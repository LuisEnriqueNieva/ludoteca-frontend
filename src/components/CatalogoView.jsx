import { useEffect, useState } from 'react';
import Panel from './Panel';
import { getJuegos, getEditoriales, getJuegoPorId } from '../services/catalogoApi';
import { SERVICE_URLS } from '../config';

export default function CatalogoView() {
  const [juegos, setJuegos] = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [seleccionId, setSeleccionId] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const nombreEditorial = (id) => editoriales.find((e) => e.id === id)?.nombre ?? `#${id}`;

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
      meta={`MS1 · Python + MySQL · ${SERVICE_URLS.catalogo}`}
      endpoints={['GET /juegos', 'GET /juegos/{id}', 'GET /editoriales']}
    >
      <div className="action-row">
        <input
          className="text-input"
          placeholder="ID de juego, ej. 3"
          value={seleccionId}
          onChange={(e) => setSeleccionId(e.target.value)}
        />
        <button className="action" onClick={consultarDetalle}>
          Consultar GET /juegos/{'{id}'}
        </button>
      </div>

      {error && <p className="error-note">{error}</p>}

      {detalle && (
        <div className="profile-card" style={{ marginBottom: '1.1rem' }}>
          <h3>{detalle.titulo}</h3>
          <p style={{ margin: 0 }}>
            {detalle.genero} · complejidad {detalle.complejidad} · {detalle.jugadores_min}-
            {detalle.jugadores_max} jugadores · editorial: {nombreEditorial(detalle.editorial_id)}
          </p>
        </div>
      )}

      {loading ? (
        <p className="loading-note">Cargando catálogo…</p>
      ) : juegos.length === 0 ? (
        <p className="empty-note">No hay juegos registrados todavía.</p>
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
            {juegos.slice(0, 300).map((j) => (
              <tr key={j.id}>
                <td>{j.titulo}</td>
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
    </Panel>
  );
}
