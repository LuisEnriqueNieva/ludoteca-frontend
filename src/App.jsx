import { useState } from 'react';
import { USE_MOCKS } from './config';
import OperativoView from './components/OperativoView';
import CatalogoView from './components/CatalogoView';
import PartidasView from './components/PartidasView';
import MembresiasView from './components/MembresiasView';
import PerfilView from './components/PerfilView';
import AnaliticaView from './components/AnaliticaView';

const MESAS = [
  { id: 'operativo', label: 'Panel Operativo', Componente: OperativoView },
  { id: 'catalogo', label: 'Catálogo (MS1)', Componente: CatalogoView },
  { id: 'partidas', label: 'Partidas (MS2)', Componente: PartidasView },
  { id: 'membresias', label: 'Reservas (MS3)', Componente: MembresiasView },
  { id: 'perfil', label: 'Clientes (MS4)', Componente: PerfilView },
  { id: 'analitica', label: 'Analítica (MS5)', Componente: AnaliticaView },
];

export default function App() {
  const [mesaActiva, setMesaActiva] = useState('operativo');
  const Activo = MESAS.find((m) => m.id === mesaActiva)?.Componente ?? OperativoView;

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="brand">
            <span className="material-symbols-outlined brand-icon">casino</span>
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

          <div className="appbar-side">
            <span className="status-badge">
              <span className="dot" />
              VITE_USE_MOCKS: {USE_MOCKS ? 'MOCK' : 'LIVE'}
            </span>
            <span className="turno-badge">
              <span className="material-symbols-outlined icon-sm">schedule</span>
              TURNO: Tarde · Mesa Central
            </span>
            <div className="user-chip">
              <div className="user-chip-text">
                <span className="user-chip-name">Ximena</span>
                <span className="user-chip-role">Encargada de Turno</span>
              </div>
              <span className="user-avatar">X</span>
            </div>
          </div>
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
            <span className="dot" /> Gateway Latency: 14ms
          </span>
          <span className="sep">|</span>
          <span>Cluster: prod-eu-central-1</span>
          <span className="sep">|</span>
          <span className="healthy">5/5 Servicios Saludables</span>
        </div>
      </footer>
    </>
  );
}