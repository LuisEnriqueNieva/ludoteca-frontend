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

export async function putJson(url, body, { signal } = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} actualizando ${url}`);
  }
  return res.json();
}

export async function deleteJson(url, { signal } = {}) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} eliminando ${url}`);
  }
  return res.json();
}

