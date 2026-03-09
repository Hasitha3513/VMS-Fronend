import { apiFetch } from '../../apiClient';

export const vehicleDailySummaryService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/daily-summaries', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/daily-summaries/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/daily-summaries', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/daily-summaries/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/daily-summaries/${id}`, { method: 'DELETE', token }),
};
