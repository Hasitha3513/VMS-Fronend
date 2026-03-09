import { apiFetch } from '../../apiClient';

export const overtimeRequestService = {
  list: (token, params) => apiFetch('/api/v1/hr/overtime-requests', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/overtime-requests/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/overtime-requests', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/overtime-requests/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/overtime-requests/${id}`, { method: 'DELETE', token }),
};
