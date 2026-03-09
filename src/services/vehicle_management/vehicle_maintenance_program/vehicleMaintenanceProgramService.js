import { apiFetch } from '../../apiClient';

export const vehicleMaintenanceProgramService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-maintenance-programs', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-maintenance-programs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-maintenance-programs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-maintenance-programs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-maintenance-programs/${id}`, { method: 'DELETE', token }),
};
