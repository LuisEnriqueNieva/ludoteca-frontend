import { useEffect, useState } from 'react';
import OperativoView from './components/OperativoView';
import CatalogoView from './components/CatalogoView';
import PartidasView from './components/PartidasView';
import MembresiasView from './components/MembresiasView';
import PerfilView from './components/PerfilView';
import AnaliticaView from './components/AnaliticaView';
import { getServiciosSaludables } from './services/health';

const MESAS = [
  { id: 'operativo', label: 'Panel Operativo', Componente: OperativoView },
  { id: 'catalogo', label: 'Catálogo (MS1)', Componente: CatalogoView },
  { id: 'partidas', label: 'Partidas (MS2)', Componente: PartidasView },
  { id: 'membresias', label: 'Reservas (MS3)', Componente: MembresiasView },
  { id: 'perfil', label: 'Clientes (MS4)', Componente: PerfilView },
  { id: 'analitica', label: 'Analítica (MS5)', Componente: AnaliticaView },
];

const HEALTH_POLL_MS = 30000;

export default function App() {
  const [mesaActiva, setMesaActiva] = useState('operativo');
  const [salud, setSalud] = useState(null);
  const [saludError, setSaludError] = useState(false);
  const Activo = MESAS.find((m) => m.id === mesaActiva)?.Componente ?? OperativoView;

  useEffect(() => {
    let vivo = true;
    async function chequear() {
      try {
        const resultado = await getServiciosSaludables();
        if (vivo) {
          setSalud(resultado);
          setSaludError(false);
        }
      } catch {
        if (vivo) setSaludError(true);
      }
    }
    chequear();
    const id = setInterval(chequear, HEALTH_POLL_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  const todoOk = salud && salud.ok === salud.total;

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="brand">
            <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id="brand-die" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffce12" />
                  <stop offset="1" stopColor="#db0080" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="4.5" fill="url(#brand-die)" />
              <g fill="#ffffff">
                <circle cx="7.5" cy="7.5" r="1.8" />
                <circle cx="16.5" cy="16.5" r="1.8" />
                <circle cx="16.5" cy="7.5" r="1.8" />
                <circle cx="7.5" cy="16.5" r="1.8" />
              </g>
            </svg>
            <div className="brand-text">
              <span className="brand-title">ludOteca</span>
              <span className="brand-sub">Panel Operativo · Staff</span>
            </div>
          </div>

          <nav className="appnav">
            {MESAS.map((m) => (
              <button
                key={m.id}
                className={m.id === mesaActiva ? 'appnav-btn active' : 'appnav-btn'}
                onClick={() => setMesaActiva(m.id)}
              >
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="app-shell">
          <Activo onNavigate={setMesaActiva} />
        </div>
      </main>

      <footer className="appfoot">
        <span>© 2026 Ludoteca · Sistema Operativo Unificado</span>
        <div className="appfoot-right">
          <span className="foot-health">
            <span className={`dot ${saludError ? 'err' : todoOk ? 'ok' : 'warn'}`} />
            {saludError
              ? 'No se pudo verificar el estado de los servicios'
              : salud
                ? `${salud.ok}/${salud.total} servicios respondiendo`
                : 'Verificando servicios…'}
          </span>
        </div>
      </footer>
    </>
  );
}