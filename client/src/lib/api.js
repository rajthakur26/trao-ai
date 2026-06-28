/**
 * Thin fetch wrapper around the backend API.
 * - Reads the JWT from localStorage and attaches it as a Bearer token.
 * - Normalises error responses into thrown Error objects with a `.status`.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'trao_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data?.error?.details;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me'),

  // trips
  listTrips: () => request('/api/trips'),
  createTrip: (payload) => request('/api/trips', { method: 'POST', body: payload }),
  getTrip: (id) => request(`/api/trips/${id}`),
  renameTrip: (id, title) => request(`/api/trips/${id}`, { method: 'PATCH', body: { title } }),
  deleteTrip: (id) => request(`/api/trips/${id}`, { method: 'DELETE' }),

  regenerateDay: (id, day, instruction) =>
    request(`/api/trips/${id}/days/${day}/regenerate`, { method: 'POST', body: { instruction } }),
  addActivity: (id, day, activity) =>
    request(`/api/trips/${id}/days/${day}/activities`, { method: 'POST', body: activity }),
  removeActivity: (id, day, activityId) =>
    request(`/api/trips/${id}/days/${day}/activities/${activityId}`, { method: 'DELETE' }),

  concierge: (id, message) =>
    request(`/api/trips/${id}/concierge`, { method: 'POST', body: { message } }),
  setShare: (id, enabled) => request(`/api/trips/${id}/share`, { method: 'POST', body: { enabled } }),

  // public
  getSharedTrip: (token) => request(`/api/public/trips/${token}`, { auth: false }),
};

export { BASE_URL };
