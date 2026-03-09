import { apiFetch } from '../../apiClient';

export const vehicleDailyActivityService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/daily-activities', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/daily-activities/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/daily-activities', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/daily-activities/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/daily-activities/${id}`, { method: 'DELETE', token }),
};
