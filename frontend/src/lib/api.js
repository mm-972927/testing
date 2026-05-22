import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('aq_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('aq_token');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

// Helper: download CSV using fetch (handles auth header properly)
export async function downloadCSV() {
  const token = localStorage.getItem('aq_token');
  const res = await fetch(`${BASE}/goals/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'achievement-report.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default api;
