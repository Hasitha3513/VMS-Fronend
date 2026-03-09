import { apiFetch } from '../../apiClient';

export const vehicleOperatingCostService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/operating-costs', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/operating-costs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/operating-costs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/operating-costs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/operating-costs/${id}`, { method: 'DELETE', token }),
};
