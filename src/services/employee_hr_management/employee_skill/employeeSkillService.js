import { apiFetch } from '../../apiClient';

export const employeeSkillService = {
  list: (token, params) => apiFetch('/api/v1/hr/employee-skills', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/employee-skills/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/employee-skills', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/employee-skills/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/employee-skills/${id}`, { method: 'DELETE', token }),
};
