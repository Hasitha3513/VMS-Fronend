import { apiFetch } from '../../apiClient';

export const vehicleFuelRecordService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-fuel-records', { token, params }),
  listByCompanyVehicle: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/vehicle-fuel-records/company-vehicle/${companyVehicleId}`, { token }),
  latestByCompanyVehicle: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/vehicle-fuel-records/company-vehicle/${companyVehicleId}/latest`, { token }),
  refillLocationOptions: (token, params) => apiFetch('/api/v1/vehicles/vehicle-fuel-records/refill-location-options', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-fuel-records/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-fuel-records', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-fuel-records/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-fuel-records/${id}`, { method: 'DELETE', token }),
};
