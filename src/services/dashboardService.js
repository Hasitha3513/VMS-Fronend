import { apiFetch } from './apiClient';

export const dashboardService = {
  effectiveMe: (token) => apiFetch('/api/v1/access/dashboard-configs/effective/me', { token }),
  listAll: (token) => apiFetch('/api/v1/access/dashboard-configs', { token }),
  create: (token, body) => apiFetch('/api/v1/access/dashboard-configs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/dashboard-configs/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/dashboard-configs/${id}`, { method: 'DELETE', token })
};
