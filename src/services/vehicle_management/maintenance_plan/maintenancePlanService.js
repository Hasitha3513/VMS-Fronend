import { apiFetch } from '../../apiClient';

export const maintenancePlanService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-plans', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-plans/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-plans', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-plans/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-plans/${id}`, { method: 'DELETE', token }),
};
