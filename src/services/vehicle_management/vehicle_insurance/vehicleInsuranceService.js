import { apiFetch } from '../../apiClient';

export const vehicleInsuranceService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-insurances', { token, params }),
  prefillByCompanyVehicle: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/vehicle-insurances/prefill/company-vehicles/${companyVehicleId}`, { token }),
  supplierOptions: (token, params) => apiFetch('/api/v1/vehicles/vehicle-insurances/supplier-options', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-insurances/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-insurances', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-insurances/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-insurances/${id}`, { method: 'DELETE', token }),
};
