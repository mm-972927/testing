import axios from 'axios';

// Production backend URL - update this to match your Vercel backend URL
const PROD_BACKEND = 'https://testing-vov1.vercel.app/api';
const BASE = import.meta.env.VITE_API_URL || PROD_BACKEND;

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('aq_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  // ONLY redirect to login if /auth/me fails with 401
  // Do NOT redirect for login failures, goal fetches, etc.
  const url = err.config?.url || '';
  if (err.response?.status === 401 && url.includes('/auth/me')) {
    localStorage.removeItem('aq_token');
    if (!window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(err);
});

export async function downloadCSV() {
  const token = localStorage.getItem('aq_token');
  const res   = await fetch(`${BASE}/goals/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'achievement-report.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default api;
