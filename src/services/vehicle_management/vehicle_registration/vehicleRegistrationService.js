import { apiFetch } from '../../apiClient';

export const vehicleRegistrationService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-registrations', { token, params }),
  prefillByCompanyVehicle: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/vehicle-registrations/prefill/company-vehicles/${companyVehicleId}`, { token }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-registrations/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-registrations', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-registrations/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-registrations/${id}`, { method: 'DELETE', token }),
};
