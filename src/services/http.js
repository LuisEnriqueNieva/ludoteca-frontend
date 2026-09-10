// Wrapper simple sobre fetch: agrega manejo de errores consistente
// y simula latencia de red cuando se usan mocks, para que la UI
// de "cargando" se sienta real desde ya.

export async function getJson(url, { signal } = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} consultando ${url}`);
  }
  return res.json();
}

export async function postJson(url, body, { signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} enviando a ${url}`);
  }
  return res.json();
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
