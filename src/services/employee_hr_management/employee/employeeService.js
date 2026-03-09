import { apiFetch } from '../../apiClient';

export const employeeService = {
  hrLookups: (token, params) => apiFetch('/api/v1/hr/dropdowns/core', { token, params }),
  listEmployees: (token, params) => apiFetch('/api/v1/hr/employees', { token, params }),
  getEmployeeById: (token, id) => apiFetch(`/api/v1/hr/employees/${id}`, { token }),
  createEmployee: (token, body) => apiFetch('/api/v1/hr/employees', { method: 'POST', token, body }),
  updateEmployee: (token, id, body) => apiFetch(`/api/v1/hr/employees/${id}`, { method: 'PUT', token, body }),
  deleteEmployee: (token, id) => apiFetch(`/api/v1/hr/employees/${id}`, { method: 'DELETE', token }),
};
