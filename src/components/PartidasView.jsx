import { useEffect, useState } from 'react';
import Panel from './Panel';
import { getPartidas, getPartidaPorId } from '../services/partidasApi';
import { SERVICE_URLS } from '../config';

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function PartidasView() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idBuscado, setIdBuscado] = useState('');
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    getPartidas()
      .then((data) => vivo && setPartidas(data))
      .catch((err) => vivo && setError(err.message))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

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

  return (
    <Panel
      title="Partidas jugadas"
      meta={`MS2 · Java + PostgreSQL · ${SERVICE_URLS.partidas}`}
      endpoints={['GET /partidas', 'GET /partidas/{id}']}
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

      {error && <p className="error-note">{error}</p>}

      {detalle && (
        <div className="profile-card" style={{ marginBottom: '1.1rem' }}>
          <h3>Mesa {detalle.mesa}</h3>
          <p style={{ margin: '0 0 0.4rem' }}>
            {formatFecha(detalle.fecha)} · {detalle.resultado}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Jugadores: {detalle.partida_jugadores.map((j) => j.nombre_jugador).join(', ')}
          </p>
        </div>
      )}

      {loading ? (
        <p className="loading-note">Cargando partidas…</p>
      ) : partidas.length === 0 ? (
        <p className="empty-note">Todavía no se ha jugado ninguna partida.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Resultado</th>
              <th>Jugadores</th>
            </tr>
          </thead>
          <tbody>
            {partidas.map((p) => (
              <tr key={p.id}>
                <td>{p.mesa}</td>
                <td>{formatFecha(p.fecha)}</td>
                <td>{p.resultado}</td>
                <td>{p.partida_jugadores.map((j) => j.nombre_jugador).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}
