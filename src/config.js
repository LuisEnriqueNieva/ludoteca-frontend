// Config centralizada: lee variables de entorno de Vite (deben empezar con VITE_).
// En Amplify se configuran en App settings > Environment variables con el mismo nombre.

// Config centralizada: lee variables de entorno de Vite (deben empezar con VITE_).
// En Amplify se configuran en App settings > Environment variables con el mismo nombre.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const SERVICE_URLS = {
  catalogo: import.meta.env.VITE_CATALOGO_URL || 'http://localhost:8001',
  partidas: import.meta.env.VITE_PARTIDAS_URL || 'http://localhost:8002',
  membresias: import.meta.env.VITE_MEMBRESIAS_URL || 'http://localhost:8003',
  perfil: import.meta.env.VITE_PERFIL_URL || 'http://localhost:8004',
  analitica: import.meta.env.VITE_ANALITICA_URL || 'http://localhost:8005',
};
