import { useState, useEffect } from 'react';
import Panel from './Panel';
import { getPerfilJugador, getListaClientes } from '../services/perfilApi';

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function PerfilView() {
  const [nombre, setNombre] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nombresDisponibles, setNombresDisponibles] = useState([]);
  const [nombreAbierto, setNombreAbierto] = useState(false);

  useEffect(() => {
    getListaClientes().then(setNombresDisponibles).catch(() => {});
  }, []);

  const q = nombre.trim().toLowerCase();
  const nombresFiltrados = q
    ? nombresDisponibles.filter((n) => n.toLowerCase().includes(q))
    : nombresDisponibles;

  function elegirNombre(n) {
    setNombre(n);
    setNombreAbierto(false);
  }

  async function buscarPerfil() {
    if (!nombre) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPerfilJugador(nombre);
      setPerfil(data);
    } catch (err) {
      setPerfil(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const juegos = perfil
    ? [...new Set(perfil.partidas.map((p) => p.juego_nombre))]
        .map((juego_nombre) => ({
          juego_nombre,
          veces: perfil.partidas.filter((p) => p.juego_nombre === juego_nombre).length,
        }))
        .sort((a, b) => b.veces - a.veces)
    : [];

  return (
    <Panel
      title="Ficha de cliente (agregador)"
    >
      <div className="action-row">
        <div className="combobox">
          <input
            className="text-input"
            placeholder="Nombre del cliente, ej. Ana (escribe para buscar)"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setNombreAbierto(true);
            }}
            onFocus={() => setNombreAbierto(true)}
            onBlur={() => setTimeout(() => setNombreAbierto(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nombresFiltrados[0]) {
                elegirNombre(nombresFiltrados[0]);
              }
            }}
          />
          {nombreAbierto && (
            <ul className="combobox-list">
              {nombresFiltrados.length === 0 ? (
                <li className="combobox-empty">Sin coincidencias</li>
              ) : (
                nombresFiltrados.slice(0, 80).map((n) => (
                  <li
                    key={n}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => elegirNombre(n)}
                  >
                    {n}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button className="action" onClick={buscarPerfil} disabled={loading}>
          {loading ? 'Consultando…' : 'Armar ficha del cliente'}
        </button>
      </div>

      {error && <p className="error-note">{error}</p>}

      {perfil && (
        <div className="profile-card">
          <h3>{perfil.jugador}</h3>
          <div className="stat-grid" style={{ marginBottom: '0.9rem' }}>
            <div className="stat-card">
              <div className="stat-label">Partidas jugadas</div>
              <div className="stat-value">{perfil.partidas.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Membresía</div>
              <div className="stat-value" style={{ fontSize: '1.1rem' }}>
                {perfil.membresia}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Próximas reservas</div>
              <div className="stat-value">{perfil.reservas.length}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">Juegos jugados</span>
                <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
                  Títulos más frecuentes
                </h3>
              </div>
            </div>
            {juegos.length === 0 ? (
              <p className="empty-note">Ningún juego registrado.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Juego</th>
                    <th style={{ textAlign: 'right' }}>Partidas</th>
                  </tr>
                </thead>
                <tbody>
                  {juegos.map((j) => (
                    <tr key={j.juego_nombre}>
                      <td>{j.juego_nombre}</td>
                      <td style={{ textAlign: 'right' }}>{j.veces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">Próximas reservas</span>
                <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
                  Reservas del cliente
                </h3>
              </div>
            </div>
            {perfil.reservas.length === 0 ? (
              <p className="empty-note">No hay reservas registradas.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mesa</th>
                    <th>Horario</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {perfil.reservas.map((r, i) => (
                    <tr key={i}>
                      <td>Mesa {String(r.mesa).padStart(2, '0')}</td>
                      <td>{formatFecha(r.horario)}</td>
                      <td>{r.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}