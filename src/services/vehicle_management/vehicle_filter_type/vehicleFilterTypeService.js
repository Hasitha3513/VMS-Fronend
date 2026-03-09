import { apiFetch } from '../../apiClient';

export const vehicleFilterTypeService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-filter-types', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-filter-types/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-filter-types', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-filter-types/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-filter-types/${id}`, { method: 'DELETE', token }),
};
