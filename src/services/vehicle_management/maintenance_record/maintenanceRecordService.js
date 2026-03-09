import { apiFetch } from '../../apiClient';

export const maintenanceRecordService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-records', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-records/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-records', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-records/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-records/${id}`, { method: 'DELETE', token }),
};
