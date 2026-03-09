import { apiFetch } from '../../apiClient';

export const permissionService = {
  list: (token, params) => apiFetch('/api/v1/access/permissions', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/permissions/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/permissions', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/permissions/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/permissions/${id}`, { method: 'DELETE', token }),
};
