import { apiFetch } from '../../apiClient';

export const hiredVehicleIdTypeService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicle-id-types', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-id-types/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/hired-vehicle-id-types', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/hired-vehicle-id-types/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-id-types/${id}`, { method: 'DELETE', token }),
};
