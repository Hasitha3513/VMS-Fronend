import { apiFetch } from '../../apiClient';

export const maintenancePlanItemService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-plan-items', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-plan-items/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-plan-items', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-plan-items/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-plan-items/${id}`, { method: 'DELETE', token }),
};
