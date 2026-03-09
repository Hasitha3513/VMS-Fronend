import { apiFetch } from '../../apiClient';

export const employeeGradeService = {
  list: (token, params) => apiFetch('/api/v1/hr/employee-grades', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/employee-grades/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/employee-grades', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/employee-grades/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/employee-grades/${id}`, { method: 'DELETE', token }),
};
