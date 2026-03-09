import { apiFetch } from '../apiClient';

export const supplierService = {
  overview: (token) => apiFetch('/api/v1/vehicles/suppliers/overview', { token }),
  details: (token, params) => apiFetch('/api/v1/vehicles/suppliers/details', { token, params }),
  create: (token, body) => apiFetch('/api/v1/vehicles/suppliers', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/suppliers/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/suppliers/${id}`, { method: 'DELETE', token }),
};
