import { apiFetch } from '../../apiClient';

export const repairJobService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/repair-jobs', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/repair-jobs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/repair-jobs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/repair-jobs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/repair-jobs/${id}`, { method: 'DELETE', token }),
};
