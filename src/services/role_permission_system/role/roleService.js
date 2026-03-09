import { apiFetch } from '../../apiClient';

export const roleService = {
  list: (token, params) => apiFetch('/api/v1/access/roles', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/roles/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/roles', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/roles/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/roles/${id}`, { method: 'DELETE', token }),
};
