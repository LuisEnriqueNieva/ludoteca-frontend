// Config centralizada: lee variables de entorno de Vite (deben empezar con VITE_).
// En Amplify se configuran en App settings > Environment variables con el mismo nombre.

// Único punto de entrada hacia los 5 microservicios (producción).
// El Gateway enruta según la ruta: /juegos/*, /editoriales/*, /partidas/*,
// /clientes/*, /perfil, /analitica/*  (rutas desnudas, sin stage ni prefijo).
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL;

// Para desarrollo local se puede sobreescribir un microservicio puntual con
// VITE_*_URL; si no, todo sale por el gateway. Último fallback: localhost.
export const SERVICE_URLS = {
  catalogo: import.meta.env.VITE_CATALOGO_URL || GATEWAY || 'http://localhost:8001',
  partidas: import.meta.env.VITE_PARTIDAS_URL || GATEWAY || 'http://localhost:8002',
  membresias: import.meta.env.VITE_MEMBRESIAS_URL || GATEWAY || 'http://localhost:8003',
  perfil: import.meta.env.VITE_PERFIL_URL || GATEWAY || 'http://localhost:8004',
  analitica: import.meta.env.VITE_ANALITICA_URL || GATEWAY || 'http://localhost:8005',
};