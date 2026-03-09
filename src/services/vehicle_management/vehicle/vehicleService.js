import { apiFetch } from '../../apiClient';

export const vehicleService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/records', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/records/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/records', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/records/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/records/${id}`, { method: 'DELETE', token }),
};
