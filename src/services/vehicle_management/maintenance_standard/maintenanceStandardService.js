import { apiFetch } from '../../apiClient';

export const maintenanceStandardService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-standards', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-standards/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-standards', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-standards/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-standards/${id}`, { method: 'DELETE', token }),
};
