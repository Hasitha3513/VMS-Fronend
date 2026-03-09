import { apiFetch } from '../../apiClient';

export const vehicleLocationService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/locations/list', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/locations/${id}`, { token }),
  lookups: (token, params) => apiFetch('/api/v1/vehicles/locations/lookups', { token, params }),
  companyVehicleLookups: (token, companyVehicleId, params) => apiFetch(`/api/v1/vehicles/locations/company-vehicles/${companyVehicleId}/lookups`, { token, params }),
  companyVehicleList: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/locations/company-vehicles/${companyVehicleId}/list`, { token }),
  locationNameOptions: (token, params) => apiFetch('/api/v1/vehicles/locations/options/location-names', { token, params }),
  create: (token, body) => apiFetch('/api/v1/vehicles/locations', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/locations/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/locations/${id}`, { method: 'DELETE', token }),
};
