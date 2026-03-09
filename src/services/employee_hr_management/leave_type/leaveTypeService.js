import { apiFetch } from '../../apiClient';

export const leaveTypeService = {
  list: (token, params) => apiFetch('/api/v1/hr/leave-types', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/leave-types/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/leave-types', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/leave-types/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/leave-types/${id}`, { method: 'DELETE', token }),
};
