import { apiFetch } from '../../apiClient';

export const systemModuleService = {
  list: (token, params) => apiFetch('/api/v1/access/system-modules', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/system-modules/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/system-modules', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/system-modules/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/system-modules/${id}`, { method: 'DELETE', token }),
};
