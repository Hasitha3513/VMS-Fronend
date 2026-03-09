import { apiFetch } from '../../apiClient';

export const vehicleFitnessCertificateService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-fitness-certificates', { token, params }),
  prefillByCompanyVehicle: (token, companyVehicleId) => apiFetch(`/api/v1/vehicles/vehicle-fitness-certificates/prefill/company-vehicles/${companyVehicleId}`, { token }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-fitness-certificates/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-fitness-certificates', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-fitness-certificates/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-fitness-certificates/${id}`, { method: 'DELETE', token }),
};
