import { apiFetch } from '../../apiClient';

export const hiredVehicleFitnessCertificateService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicle-fitness-certificates', { token, params }),
  prefillByHiredVehicle: (token, hiredVehicleId) => apiFetch(`/api/v1/vehicles/hired-vehicle-fitness-certificates/prefill/hired-vehicles/${hiredVehicleId}`, { token }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-fitness-certificates/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/hired-vehicle-fitness-certificates', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/hired-vehicle-fitness-certificates/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-fitness-certificates/${id}`, { method: 'DELETE', token }),
};
