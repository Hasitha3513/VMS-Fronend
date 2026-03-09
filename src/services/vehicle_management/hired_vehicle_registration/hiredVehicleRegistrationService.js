import { apiFetch } from '../../apiClient';

export const hiredVehicleRegistrationService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicle-registrations', { token, params }),
  prefillByHiredVehicle: (token, hiredVehicleId) => apiFetch(`/api/v1/vehicles/hired-vehicle-registrations/prefill/hired-vehicles/${hiredVehicleId}`, { token }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-registrations/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/hired-vehicle-registrations', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/hired-vehicle-registrations/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-registrations/${id}`, { method: 'DELETE', token }),
};
