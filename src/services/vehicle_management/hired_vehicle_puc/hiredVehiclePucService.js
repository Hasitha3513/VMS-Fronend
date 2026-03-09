import { apiFetch } from '../../apiClient';

export const hiredVehiclePucService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicle-pucs', { token, params }),
  prefillByHiredVehicle: (token, hiredVehicleId) => apiFetch(`/api/v1/vehicles/hired-vehicle-pucs/prefill/hired-vehicles/${hiredVehicleId}`, { token }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-pucs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/hired-vehicle-pucs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/hired-vehicle-pucs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-pucs/${id}`, { method: 'DELETE', token }),
};
