import { apiFetch } from '../../apiClient';

export const maintenanceProgramService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-programs', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-programs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-programs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-programs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-programs/${id}`, { method: 'DELETE', token }),
};
