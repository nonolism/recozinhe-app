/**
 * Todas as chamadas ao backend ficam aqui.
 * Cada função corresponde a um endpoint do Django (ver README do backend).
 */
import { API_URL } from './config';

let token = null;
let onUnauthorized = null;

export function setToken(value) {
  token = value;
}

// Chamado quando o backend responde 401 (token inválido): o app volta para o login
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Token ${token}`;

  let payload;
  if (form) {
    payload = form; // multipart: o fetch define o Content-Type sozinho
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_URL + path, { method, headers, body: payload });
  } catch (error) {
    throw new Error(
      `Não foi possível conectar ao servidor (${API_URL}). ` +
        'Confira se o backend está rodando com "runserver 0.0.0.0:8000" ' +
        'e se o celular está na mesma rede Wi-Fi do computador.'
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new Error(errorMessage(data, response.status));
  }
  return data;
}

// Transforma o erro do Django em uma frase para mostrar ao usuário
function errorMessage(data, status) {
  if (!data) return `Erro ${status} no servidor.`;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data === 'object') {
    return Object.values(data)
      .flat()
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join('\n');
  }
  return `Erro ${status} no servidor.`;
}

function query(params) {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// ---------------- Autenticação ----------------
export const login = (username, password) =>
  request('/login/', { method: 'POST', body: { username, password } });

export const register = (data) => request('/register/', { method: 'POST', body: data });

// ---------------- Perfil ----------------
export const getProfile = () => request('/profile/');

// ---------------- Fotos ----------------
export function uploadPhoto(uri, source) {
  const form = new FormData();
  form.append('image', { uri, name: 'foto.jpg', type: 'image/jpeg' });
  form.append('source', source); // 'camera' ou 'galeria'
  return request('/photos/', { method: 'POST', form });
}

export const getPhotos = () => request('/photos/');
export const getPhoto = (id) => request(`/photos/${id}/`);
export const getLatestPhoto = () => request('/photos/latest/');

// ---------------- Receitas ----------------
export const getCategories = () => request('/categories/');
export const getRecipes = ({ category, search } = {}) =>
  request(`/recipes/${query({ category, search })}`);
export const getSuggestedRecipes = ({ category, search, photo } = {}) =>
  request(`/recipes/suggested/${query({ category, search, photo })}`);
export const getRecipe = (id) => request(`/recipes/${id}/`);

// ---------------- Reaproveitamentos (impacto) ----------------
export const registerReuse = (data) => request('/reuses/', { method: 'POST', body: data });
export const getReuses = () => request('/reuses/');
