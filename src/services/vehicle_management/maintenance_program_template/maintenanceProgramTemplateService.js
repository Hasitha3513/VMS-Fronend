import { apiFetch } from '../../apiClient';

export const maintenanceProgramTemplateService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/maintenance-program-templates', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-program-templates/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/maintenance-program-templates', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/maintenance-program-templates/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/maintenance-program-templates/${id}`, { method: 'DELETE', token }),
};
