import { apiFetch } from '../../apiClient';

export const vehicleAssignmentService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/assignments', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/assignments/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/assignments', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/assignments/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/assignments/${id}`, { method: 'DELETE', token }),
};
