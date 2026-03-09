import { apiFetch } from '../../apiClient';

export const vehiclePucService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-pucs', { token, params }),
  prefillByCompanyVehicle: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/vehicle-pucs/prefill/company-vehicles/${companyVehicleId}`, { token }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-pucs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-pucs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-pucs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-pucs/${id}`, { method: 'DELETE', token }),
};
