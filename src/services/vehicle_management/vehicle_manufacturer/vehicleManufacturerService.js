import { apiFetch } from '../../apiClient';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') sp.append(k, v);
    });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

function parseFileName(contentDisposition) {
  if (!contentDisposition) return 'vehicle-manufacturers.xlsx';
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const simpleMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return simpleMatch?.[1] || 'vehicle-manufacturers.xlsx';
}

export const vehicleManufacturerService = {
  list: (t, p) => apiFetch('/api/v1/vehicles/manufacturers', { token: t, params: p, skipCache: true }),
  getById: (t, id) => apiFetch(`/api/v1/vehicles/manufacturers/${id}`, { token: t }),
  create: (t, b) => apiFetch('/api/v1/vehicles/manufacturers', { method: 'POST', token: t, body: b }),
  update: (t, id, b) => apiFetch(`/api/v1/vehicles/manufacturers/${id}`, { method: 'PUT', token: t, body: b }),
  delete: (t, id) => apiFetch(`/api/v1/vehicles/manufacturers/${id}`, { method: 'DELETE', token: t }),
  exportExcel: async (t, p) => {
    const url = `${API_BASE}/api/v1/vehicles/manufacturers/export/excel${buildQuery(p)}`;
    const headers = {};
    if (t) headers['X-Session-Token'] = t;
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed (${res.status})`);
    }
    const blob = await res.blob();
    const filename = parseFileName(res.headers.get('content-disposition'));
    return { blob, filename };
  },
};
