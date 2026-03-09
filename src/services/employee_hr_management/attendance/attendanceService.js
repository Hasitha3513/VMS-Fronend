import { apiFetch } from '../../apiClient';

export const attendanceService = {
  list: (token, params) => apiFetch('/api/v1/hr/attendances', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/attendances/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/attendances', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/attendances/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/attendances/${id}`, { method: 'DELETE', token }),
};
