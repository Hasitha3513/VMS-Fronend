import { apiFetch } from '../../apiClient';

export const hiredVehicleInsuranceService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicle-insurances', { token, params }),
  prefillByHiredVehicle: (token, hiredVehicleId) => apiFetch(`/api/v1/vehicles/hired-vehicle-insurances/prefill/hired-vehicles/${hiredVehicleId}`, { token }),
  supplierOptions: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicle-insurances/supplier-options', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-insurances/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/hired-vehicle-insurances', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/hired-vehicle-insurances/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicle-insurances/${id}`, { method: 'DELETE', token }),
};
