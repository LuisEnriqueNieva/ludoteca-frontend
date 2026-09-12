import { useEffect, useState } from 'react';
import Panel from './Panel';
import { getJuegoMasJugado, getMembresiaVsFrecuencia, getHorarioPico } from '../services/analiticaApi';
import { SERVICE_URLS } from '../config';

export default function AnaliticaView() {
  const [porComplejidad, setPorComplejidad] = useState([]);
  const [membresiaFrecuencia, setMembresiaFrecuencia] = useState([]);
  const [horarioPico, setHorarioPico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    Promise.all([getJuegoMasJugado(), getMembresiaVsFrecuencia(), getHorarioPico()])
      .then(([juego, membresia, horario]) => {
        if (!vivo) return;
        setPorComplejidad(juego.por_complejidad);
        setMembresiaFrecuencia(membresia);
        setHorarioPico(horario);
        setError(null);
      })
      .catch((err) => vivo && setError(err.message))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  const maxReservas = Math.max(1, ...horarioPico.map((h) => h.reservas));

  return (
    <Panel
      title="Analítica de la red de cafés"
      endpoints={['GET /analitica/juego-mas-jugado', 'GET /analitica/membresia-vs-frecuencia', 'GET /analitica/horario-pico']}
    >
      {loading && <p className="loading-note">Consultando analítica…</p>}
      {error && <p className="error-note">{error}</p>}

      {!loading && !error && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '0 0 0.6rem' }}>
            Juego más jugado por complejidad
          </h3>
          <div className="stat-grid" style={{ marginBottom: '1.4rem' }}>
            {porComplejidad.map((row) => (
              <div className="stat-card" key={row.complejidad}>
                <div className="stat-label">Complejidad {row.complejidad}</div>
                <div className="stat-value" style={{ fontSize: '1.15rem' }}>
                  {row.juego}
                </div>
                <div className="service-meta">{row.veces_jugado} partidas</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '0 0 0.6rem' }}>
            Visitas promedio al mes según membresía
          </h3>
          <div className="stat-grid" style={{ marginBottom: '1.4rem' }}>
            {membresiaFrecuencia.map((row) => (
              <div className="stat-card" key={row.plan}>
                <div className="stat-label">Plan {row.plan}</div>
                <div className="stat-value">{row.visitas_promedio_mes}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '0 0 0.6rem' }}>
            Horario de mayor demanda
          </h3>
          {horarioPico.map((row) => (
            <div className="bar-row" key={row.horario}>
              <span>{row.horario}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(row.reservas / maxReservas) * 100}%` }} />
              </div>
              <span>{row.reservas}</span>
            </div>
          ))}
        </>
      )}
    </Panel>
  );
}
