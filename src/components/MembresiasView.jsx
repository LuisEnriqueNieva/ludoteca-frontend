import { useEffect, useState } from 'react';
import Panel from './Panel';
import { getClientes, getReservasDeCliente, crearReserva } from '../services/membresiasApi';
import { SERVICE_URLS } from '../config';

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function MembresiasView() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clienteId, setClienteId] = useState('');
  const [reservas, setReservas] = useState(null);
  const [mesa, setMesa] = useState('');
  const [horario, setHorario] = useState('');
  const [mensajeReserva, setMensajeReserva] = useState(null);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    getClientes()
            .then((data) => vivo && setClientes(data.slice(0, 300)))
      .catch((err) => vivo && setError(err.message))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  async function consultarReservas() {
    if (!clienteId) return;
    try {
      setError(null);
      const r = await getReservasDeCliente(clienteId);
      setReservas(r);
    } catch (err) {
      setReservas(null);
      setError(err.message);
    }
  }

    async function enviarReserva() {
    if (!clienteId || !mesa || !horario) {
      setMensajeReserva('Completa cliente, mesa y horario antes de reservar.');
      return;
    }
    try {
      setError(null);
      const clienteActualizado = await crearReserva(clienteId, { mesa: Number(mesa), horario, estado: 'confirmada' });
      const nueva = clienteActualizado.reservas.at(-1);
      setMensajeReserva(`Reserva creada: mesa ${nueva.mesa}, estado "${nueva.estado}".`);
      setClientes((prev) => prev.map((c) => (c._id === clienteId ? clienteActualizado : c)));
    } catch (err) {
      setMensajeReserva(null);
      setError(err.message);
    }
  }

  return (
    <Panel
      title="Membresías y reservas"
    >
      <div className="action-row">
        <select className="text-input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nombre} ({c.plan})
            </option>
          ))}
        </select>
        <button className="action" onClick={consultarReservas}>
          Ver reservas del cliente
        </button>
      </div>

      <div className="action-row">
        <input className="text-input" placeholder="Mesa, ej. 3" value={mesa} onChange={(e) => setMesa(e.target.value)} style={{ minWidth: 100 }} />
        <input
          className="text-input"
          placeholder="Horario ISO, ej. 2026-09-15T19:00:00Z"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
        />
        <button className="action" onClick={enviarReserva}>
          Registrar reserva
        </button>
      </div>

      {mensajeReserva && <p className="loading-note">{mensajeReserva}</p>}
      {error && <p className="error-note">{error}</p>}

      {reservas && (
        <div className="profile-card" style={{ marginBottom: '1.1rem' }}>
          <h3>Reservas del cliente</h3>
          {reservas.length === 0 ? (
            <p className="empty-note">Este cliente no tiene reservas activas.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {reservas.map((r, i) => (
                <li key={i}>
                  Mesa {r.mesa} · {formatFecha(r.horario)} · {r.estado}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <p className="loading-note">Cargando clientes…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Plan</th>
              <th>Reservas activas</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c._id}>
                <td>{c.nombre}</td>
                <td>{c.plan}</td>
                <td>{c.reservas.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}
