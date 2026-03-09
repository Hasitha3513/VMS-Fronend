import { apiFetch } from '../../apiClient';

export const maintenanceScheduleService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-schedules', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-schedules/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-schedules', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-schedules/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-schedules/${id}`, { method: 'DELETE', token }),
};
