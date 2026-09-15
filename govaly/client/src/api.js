import axios from 'axios';
import storage from './storage.js';

// The merged Backend exposes the customer API below /api/v1/customer.
// Keep the UI modules on their simple legacy paths and translate them here.
const api = axios.create({ baseURL: '/api/v1' });

function backendPath(config) {
  const url = String(config.url || '');
  const map = [
    [/^\/auth\/login$/, '/customer/auth/login'],
    [/^\/auth\/register$/, '/customer/auth/register'],
    [/^\/auth\/me$/, '/customer/me'],
    [/^\/auth\/change-password$/, '/customer/me/password'],
    [/^\/auth\/wishlist(\/.*)?$/, '/customer/wishlist$1'],
    [/^\/categories(\/.*)?$/, '/categories$1'],
    [/^\/orders\/mine$/, '/customer/orders'],
    [/^\/orders(\/.*)?$/, '/customer$1'],
    [/^\/cart(\/.*)?$/, '/customer/cart$1'],
    [/^\/reviews(\/.*)?$/, '/customer/reviews$1'],
  ];
  for (const [pattern, replacement] of map) if (pattern.test(url)) return url.replace(pattern, replacement);
  return url;
}

api.interceptors.request.use((config) => {
  config.url = backendPath(config);
  const token = storage.get('govaly_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((r) => r, async (err) => {
  const original = err.config || {};
  if (err.response?.status === 401 && !original._retry) {
    original._retry = true;
    storage.remove('govaly_token');
    storage.remove('govaly_refresh');
    window.dispatchEvent(new Event('govaly:logout'));
  }
  throw err;
});

export const errMsg = (e, fallback = 'Something went wrong') => e?.response?.data?.message || e?.message || fallback;
export default api;
