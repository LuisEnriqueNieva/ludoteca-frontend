import { useEffect, useRef, useState } from 'react';
import Panel from './Panel';
import Paginador from './Paginador';
import { getClientes, getReservasDeCliente, crearReserva } from '../services/membresiasApi';
import { SERVICE_URLS } from '../config';
import { formatFecha } from '../services/format';

const TAMANO_PAGINA = 20;

export default function MembresiasView() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clienteId, setClienteId] = useState('');
  const [clienteQuery, setClienteQuery] = useState('');
  const [clienteAbierto, setClienteAbierto] = useState(false);
  const [reservas, setReservas] = useState(null);
  const [mesa, setMesa] = useState('');
  const [horario, setHorario] = useState('');
  const [mensajeReserva, setMensajeReserva] = useState(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    getClientes()
      .then((data) => vivo && setClientes(data))
      .catch((err) => vivo && setError(err.message))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [clientes, clienteQuery]);

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

  const q = clienteQuery.trim().toLowerCase();
  const clientesFiltrados = q
    ? clientes.filter(
        (c) =>
          (c.nombre || '').toLowerCase().includes(q) ||
          (c.plan || '').toLowerCase().includes(q)
      )
    : clientes;
  const totalPaginas = Math.ceil(clientesFiltrados.length / TAMANO_PAGINA);
  const paginaActual = Math.min(pagina, Math.max(1, totalPaginas));
  const inicio = (paginaActual - 1) * TAMANO_PAGINA;
  const clientesPagina = clientesFiltrados.slice(inicio, inicio + TAMANO_PAGINA);

  function elegirCliente(c) {
    setClienteId(c._id);
    setClienteQuery(c.nombre);
    setClienteAbierto(false);
  }

    async function enviarReserva() {
    if (!clienteId || !mesa || !horario) {
      setMensajeReserva('Completa cliente, mesa y horario antes de reservar.');
      return;
    }
    try {
      setError(null);
      const horarioIso = new Date(horario).toISOString();
      const clienteActualizado = await crearReserva(clienteId, { mesa: Number(mesa), horario: horarioIso, estado: 'confirmada' });
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
        <div className="combobox">
          <input
            className="text-input"
            placeholder="Selecciona un cliente (escribe para buscar)"
            value={clienteQuery}
            onChange={(e) => {
              setClienteQuery(e.target.value);
              setClienteAbierto(true);
            }}
            onFocus={() => setClienteAbierto(true)}
            onBlur={() => setTimeout(() => setClienteAbierto(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && clientesFiltrados[0]) {
                elegirCliente(clientesFiltrados[0]);
              }
            }}
          />
          {clienteAbierto && (
            <ul className="combobox-list">
              {clientesFiltrados.length === 0 ? (
                <li className="combobox-empty">Sin coincidencias</li>
              ) : (
                clientesFiltrados.slice(0, 80).map((c) => (
                  <li
                    key={c._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => elegirCliente(c)}
                  >
                    {c.nombre} ({c.plan})
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button className="action" onClick={consultarReservas}>
          Ver reservas del cliente
        </button>
      </div>

      <div className="action-row">
        <input className="text-input" placeholder="Mesa, ej. 3" value={mesa} onChange={(e) => setMesa(e.target.value)} style={{ minWidth: 100 }} />
        <input
          type="datetime-local"
          className="text-input"
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
            {clientesPagina.map((c) => (
              <tr key={c._id}>
                <td>{c.nombre}</td>
                <td>{c.plan}</td>
                <td>{c.reservas.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Paginador
        total={clientesFiltrados.length}
        pagina={paginaActual}
        tamano={TAMANO_PAGINA}
        onCambioPagina={setPagina}
      />
    </Panel>
  );
}
