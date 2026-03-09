import { apiFetch } from '../../apiClient';

export const maintenanceStrategyService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-strategies', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-strategies/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-strategies', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-strategies/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-strategies/${id}`, { method: 'DELETE', token }),
};
