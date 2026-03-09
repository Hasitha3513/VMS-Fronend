import { apiFetch } from '../../apiClient';

export const leaveApplicationService = {
  list: (token, params) => apiFetch('/api/v1/hr/leave-applications', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/leave-applications/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/leave-applications', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/leave-applications/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/leave-applications/${id}`, { method: 'DELETE', token }),
};
