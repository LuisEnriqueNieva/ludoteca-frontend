import { useState, useEffect } from 'react';
import Panel from './Panel';
import { getPerfilJugador, getListaClientes } from '../services/perfilApi';
import { SERVICE_URLS } from '../config';

export default function PerfilView() {
  const [nombre, setNombre] = useState('María');
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nombresDisponibles, setNombresDisponibles] = useState([]);

  useEffect(() => {
    getListaClientes().then(setNombresDisponibles).catch(() => {});
  }, []);

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

  return (
    <Panel
      title="Ficha de cliente (agregador)"
      endpoints={['GET /perfil', 'GET /perfil/lista']}
    >
      <div className="action-row">
        <input
          className="text-input"
          list="lista-clientes"
          placeholder="Nombre del cliente, ej. Ana"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <datalist id="lista-clientes">
          {nombresDisponibles.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
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
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            <strong>Juegos jugados:</strong>{' '}
            {perfil.partidas.length > 0
              ? [...new Set(perfil.partidas.map((p) => p.juego_nombre))].join(', ')
              : 'ninguno registrado'}
          </p>
        </div>
      )}
    </Panel>
  );
}