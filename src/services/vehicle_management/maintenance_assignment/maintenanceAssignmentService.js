import { apiFetch } from '../../apiClient';

export const maintenanceAssignmentService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-assignments', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-assignments/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-assignments', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-assignments/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-assignments/${id}`, { method: 'DELETE', token }),
};
