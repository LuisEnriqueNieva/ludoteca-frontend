import { useEffect, useState } from 'react';
import { getJuegos, getEditoriales } from '../services/catalogoApi';
import { getPartidas } from '../services/partidasApi';
import { getClientes } from '../services/membresiasApi';
import { getJuegoMasJugado, getHorarioPico } from '../services/analiticaApi';
import { USE_MOCKS, SERVICE_URLS } from '../config';

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function formatHora(iso) {
  try {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const TECH = {
  catalogo: 'Python 3.11 + MySQL',
  partidas: 'Java 17 + PostgreSQL',
  membresias: 'Node.js 20 + MongoDB',
  perfil: 'Agregador Gateway',
  analitica: 'Python + AWS Athena',
};

const SERVICIOS = [
  { id: 'catalogo', nombre: 'MS1 Catálogo', url: SERVICE_URLS.catalogo },
  { id: 'partidas', nombre: 'MS2 Partidas', url: SERVICE_URLS.partidas },
  { id: 'membresias', nombre: 'MS3 Reservas', url: SERVICE_URLS.membresias },
  { id: 'perfil', nombre: 'MS4 Clientes', url: SERVICE_URLS.perfil },
  { id: 'analitica', nombre: 'MS5 Analítica', url: SERVICE_URLS.analitica },
];

function formatHoraSync(d) {
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const POLLING_MS = 20000;

export default function OperativoView({ onNavigate }) {
  const [juegos, setJuegos] = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [porComplejidad, setPorComplejidad] = useState([]);
  const [horarioPico, setHorarioPico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaSync, setUltimaSync] = useState(null);

  useEffect(() => {
    cargarDatos();
    const id = setInterval(() => cargarDatos({ silencioso: true }), POLLING_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    async function cargarDatos({ silencioso } = {}) {
    if (!silencioso) setLoading(true);
    setError(null);
    try {
      const [j, e, p, c] = await Promise.all([
        getJuegos(),
        getEditoriales(),
        getPartidas(),
        getClientes(),
      ]);
      setJuegos(j);
      setEditoriales(e);
      setPartidas(p);
      setClientes(c);
      setUltimaSync(new Date());
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    try {
      const [juego, horario] = await Promise.all([getJuegoMasJugado(), getHorarioPico()]);
      setPorComplejidad(juego.por_complejidad);
      setHorarioPico(horario);
    } catch (err) {
      console.log('MS5 (analítica) no disponible todavía:', err.message);
      setPorComplejidad([]);
      setHorarioPico([]);
    }

    setLoading(false);
  }

  const nombreJuego = (id) => juegos.find((j) => j.id === id)?.titulo ?? `#${id}`;
  const subJuego = (id) => {
    const j = juegos.find((x) => x.id === id);
    if (!j) return '';
    const ed = editoriales.find((e) => e.id === j.editorial_id)?.nombre ?? `#${j.editorial_id}`;
    return `${ed} · ${j.genero}`;
  };

  const mesasActivas = new Set(partidas.map((p) => p.mesa)).size;

  const reservasConfirmadas = clientes.reduce(
    (acc, c) => acc + c.reservas.filter((r) => r.estado === 'confirmada').length,
    0
  );

  const ultimasPartidas = [...partidas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 3);

  const proximasReservas = clientes
    .flatMap((c) => c.reservas.map((r) => ({ clienteId: c._id, nombre: c.nombre, ...r })))
    .filter((r) => r.estado === 'confirmada')
    .sort((a, b) => new Date(a.horario) - new Date(b.horario))
    .slice(0, 4);

  const maxReservas = Math.max(1, ...horarioPico.map((h) => h.reservas));
  const topJuego = porComplejidad.length
    ? [...porComplejidad].sort((a, b) => b.veces_jugado - a.veces_jugado)[0]
    : null;
  const pico = horarioPico.length
    ? [...horarioPico].sort((a, b) => b.reservas - a.reservas)[0]
    : null;

  // datasource para el gráfico SVG
  const slotW = horarioPico.length ? (510 - 70) / horarioPico.length : 0;

  return (
    <>
      <div className="disp-bar">
        <div className="disp-left">
          <div className="disp-titlerow">
            <span className="disp-chip">Gateway Dispatch</span>
            <h2 className="disp-title">Panel Operativo Global · Gateway Central v1.8</h2>
            <span className="disp-mock-pill">
              <span className="dot" /> {USE_MOCKS ? 'MOCK ACTIVO (JSON src/mocks/)' : 'LIVE (.env)'}
            </span>
            <span className="disp-sync">
              <span className="material-symbols-outlined icon-sm">cloud_sync</span>
              Auto-refresh 20s · Última sync {ultimaSync ? formatHoraSync(ultimaSync) : '…'}
            </span>
          </div>
          <p className="disp-sub">
            Orquestación de microservicios y monitorización en tiempo real del café de juegos.
            Visualizando telemetría agregada de mesas, reservas e inventario lúdico.
          </p>
        </div>
      </div>

      {loading && <p className="loading-note">Consultando el estado de la red…</p>}
      {error && <p className="error-note">{error}</p>}

      {!loading && !error && (
        <>
          <section className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">Catálogo Total</span>
                <span className="material-symbols-outlined kpi-icon">extension</span>
              </div>
              <div className="kpi-value">{juegos.length}</div>
              <div className="kpi-sub">
                <strong>{editoriales.length}</strong> editoriales activas
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">Partidas</span>
                <span className="material-symbols-outlined kpi-icon">sports_esports</span>
              </div>
              <div className="kpi-value">{partidas.length}</div>
              <div className="kpi-sub">
                <span className="material-symbols-outlined icon-sm">trending_up</span>
                Registradas en el sistema
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">Mesas activas</span>
                <span className="material-symbols-outlined kpi-icon accent">table_restaurant</span>
              </div>
              <div className="kpi-value">{mesasActivas}</div>
              <div className="kpi-sub">Mesas con partidas registradas (MS2)</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">Clientes Registrados</span>
                <span className="material-symbols-outlined kpi-icon">person_check</span>
              </div>
              <div className="kpi-value strong">{clientes.length}</div>
              <div className="kpi-sub">Total en membresías (MS3)</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">Reservas</span>
                <span className="material-symbols-outlined kpi-icon accent">table_restaurant</span>
              </div>
              <div className="kpi-value">{reservasConfirmadas}</div>
              <div className="kpi-sub">Reservas confirmadas</div>
            </div>

            {topJuego && (
              <div className="kpi-card">
                <div className="kpi-head">
                  <span className="kpi-label">Top Título</span>
                  <span className="material-symbols-outlined kpi-icon hot">emoji_events</span>
                </div>
                <div className="kpi-value small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {topJuego.juego}
                </div>
                <div className="kpi-sub">
                  <strong>{topJuego.veces_jugado}</strong> partidas
                </div>
              </div>
            )}

            {pico && (
              <div className="kpi-card">
                <div className="kpi-head">
                  <span className="kpi-label">Pico Demanda</span>
                  <span className="material-symbols-outlined kpi-icon">schedule</span>
                </div>
                <div className="kpi-value small">{pico.horario}</div>
                <div className="kpi-sub">
                  <span className="hot-text">Reservas en franja: {pico.reservas}</span>
                </div>
              </div>
            )}
          </section>

          <section className="stack">
            <div className="sec-head">
              <div className="sec-grid">
                <div className="sec-title">
                  <span className="material-symbols-outlined icon-sm">hub</span>
                  <span className="sec-name">Arquitectura de Microservicios &amp; Enlaces Locales</span>
                </div>
                <span className="sec-meta">5 servicios · modo simulado (mock)</span>
              </div>
            </div>
            <div className="ms-grid">
              {SERVICIOS.map((s) => (
                <div className="ms-card" key={s.id}>
                  <div className="ms-card-top">
                    <div className="ms-card-head">
                      <span className="ms-title">{s.nombre}</span>
                      <span className={`ms-badge ${s.id === 'perfil' ? 'yellow' : 'green'}`}>
                        <span className="dot" /> {USE_MOCKS ? 'MOCK' : 'LIVE'}
                      </span>
                    </div>
                    <span className="ms-tech">{TECH[s.id]}</span>
                    <span className="ms-url">{s.url}</span>
                  </div>
                  <button className="ms-go" onClick={() => onNavigate(s.id)}>
                    <span>Ir a pestaña</span>
                    <span className="material-symbols-outlined icon-sm">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="home-cols">
            <div className="stack">
              {/* Distribución de carga */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <span className="eyebrow">Distribución de Carga</span>
                    <h2 className="card-title">Horario de Mayor Demanda en Café</h2>
                  </div>
                  <div className="legend">
                    <span className="legend-item">
                      <span className="swatch plain" /> Reservas por franja
                    </span>
                    <span className="legend-item">
                      <span className="swatch hot" /> Hora Pico
                    </span>
                  </div>
                </div>

                <div className="chart-box">
                  <svg role="img" aria-label="Gráfica de franjas horarias y picos de ocupación" viewBox="0 0 540 180">
                    <line className="chart-fill-grid" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="20" y2="20" />
                    <line className="chart-fill-grid" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="60" y2="60" />
                    <line className="chart-fill-grid" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="100" y2="100" />
                    <line className="chart-fill-strong" strokeWidth="1.5" x1="40" x2="520" y1="140" y2="140" />

                    {horarioPico.map((row, i) => {
                      const center = 70 + slotW * (i + 0.5);
                      const x = Math.round(center - 24);
                      const altura = Math.max(10, Math.round((row.reservas / maxReservas) * 113));
                      const y = 140 - altura;
                      const esPico = row.horario === pico.horario;
                      return (
                        <g key={row.horario}>
                          <rect
                            className={`chart-bar ${esPico ? 'peak' : ''}`}
                            height={altura}
                            rx="4"
                            width="48"
                            x={x}
                            y={y}
                          />
                          <text className="chart-text-val" textAnchor="middle" x={center} y={y - 7}>
                            {esPico ? `${row.reservas} · PICO` : row.reservas}
                          </text>
                          <text className="chart-text-label" textAnchor="middle" x={center} y="160">
                            {row.horario.split(' - ')[0]}
                          </text>
                          {esPico && <circle cx={center} cy={y} r="3" fill="#ffce12" />}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="chart-note">
                  <span>
                    <span className="material-symbols-outlined icon-sm">info</span>
                    {' '}Franja de mayor demanda según reservas confirmadas.
                  </span>
                  <span className="code">Fuente: GET /analitica/horario-pico (MS5)</span>
                </div>
              </div>

              {/* Últimas partidas */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <span className="eyebrow">Monitor de Mesas Físicas</span>
                    <h2 className="card-title">Últimas Partidas Registradas</h2>
                  </div>
                  <button className="card-link" onClick={() => onNavigate('partidas')}>
                    <span>Ver todas en MS2</span>
                    <span className="material-symbols-outlined icon-sm">open_in_new</span>
                  </button>
                </div>

                {ultimasPartidas.length === 0 ? (
                  <p className="empty-note">Todavía no se ha jugado ninguna partida.</p>
                ) : (
                  <div className="chart-box">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Mesa</th>
                          <th>Juego</th>
                          <th>Estado / Resultado</th>
                          <th style={{ textAlign: 'right' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimasPartidas.map((p, idx) => (
                          <tr key={p.id}>
                            <td>
                              <span className={`mesa-tag ${idx === 1 ? 'warn' : ''}`}>Mesa {String(p.mesa).padStart(2, '0')}</span>
                            </td>
                            <td>
                              <div className="game-block">
                                <span className="game-title">{nombreJuego(p.juego_id)}</span>
                                <span className="game-sub">{subJuego(p.juego_id)}</span>
                              </div>
                            </td>
                            <td>
                              <span className="status-pill win">
                                <span className="material-symbols-outlined icon-sm">military_tech</span>
                                {p.resultado}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="row-action" title="Detalle de partida">
                                <span className="material-symbols-outlined icon-lg">read_more</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="table-foot">
                  <span>Sincronizado vía MS2 mock (Offset local)</span>
                  <button className="foot-link" onClick={() => onNavigate('partidas')}>
                    <span className="material-symbols-outlined icon-sm">add_circle</span>
                    <span>Registrar Partida Manual</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="stack">
              {/* Reservas */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <span className="eyebrow">Turno Tarde / Noche</span>
                    <h2 className="card-title">Próximas Reservas Confirmadas</h2>
                  </div>
                  <button className="action-dark" style={{ padding: '0.35rem 0.75rem', fontSize: '12px' }} onClick={() => onNavigate('membresias')}>
                    MS3 Reservas
                  </button>
                </div>

                {proximasReservas.length === 0 ? (
                  <p className="empty-note">No hay reservas confirmadas.</p>
                ) : (
                  <div className="res-list">
                    {proximasReservas.map((r, i) => (
                      <div className="res-card" key={i}>
                        <div className="res-card-top">
                          <div className="res-person">
                            <span className={`res-avatar ${i % 3 === 0 ? 'pink' : i % 3 === 1 ? 'violet' : 'neutral'}`}>
                              {r.nombre.charAt(0)}
                            </span>
                            <div>
                              <h3 className="res-name">{r.nombre}</h3>
                              <span className="res-meta">
                                ID: {r.clienteId} · Reserva {r.estado}
                              </span>
                            </div>
                          </div>
                          <span className="res-time">{formatHora(r.horario)}</span>
                        </div>
                        <div className="res-details">
                          <span>
                            <span className="material-symbols-outlined icon-sm">table_restaurant</span>
                            {' '}Mesa {String(r.mesa).padStart(2, '0')}
                          </span>
                          <em>
                            <span className="material-symbols-outlined icon-sm">casino</span>
                            {' '}Juego por confirmar
                          </em>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn-block" onClick={() => onNavigate('membresias')}>
                  Ver las reservas del turno →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}