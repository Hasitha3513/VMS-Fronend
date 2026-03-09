import { apiFetch } from '../../apiClient';

export const employeeTrainingService = {
  list: (token, params) => apiFetch('/api/v1/hr/employee-trainings', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/hr/employee-trainings/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/hr/employee-trainings', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/hr/employee-trainings/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/hr/employee-trainings/${id}`, { method: 'DELETE', token }),
};
