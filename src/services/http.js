import axios from 'axios';

const VERBOS_ERROR = {
  GET: 'consultando',
  POST: 'enviando a',
  PUT: 'actualizando',
  DELETE: 'eliminando',
};

async function request(metodo, url, body, { signal } = {}) {
  try {
    const { data } = await axios({
      method: metodo,
      url,
      data: body,
      signal,
    });
    return data;
  } catch (error) {
    const status = error.response?.status ?? 'desconocido';
    throw new Error(`Error ${status} ${VERBOS_ERROR[metodo]} ${url}`);
  }
}

export function getJson(url, opts) {
  return request('GET', url, undefined, opts);
}

export function postJson(url, body, opts) {
  return request('POST', url, body, opts);
}

export function putJson(url, body, opts) {
  return request('PUT', url, body, opts);
}

export function deleteJson(url, opts) {
  return request('DELETE', url, undefined, opts);
}