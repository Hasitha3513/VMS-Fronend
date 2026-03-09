import { apiFetch } from '../../apiClient';

export const vehicleFilterService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-filters', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-filters/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-filters', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-filters/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-filters/${id}`, { method: 'DELETE', token }),
};
