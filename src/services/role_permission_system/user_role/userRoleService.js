import { apiFetch } from '../../apiClient';

export const userRoleService = {
  list: (token, params) => apiFetch('/api/v1/access/user-roles', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/user-roles/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/user-roles', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/user-roles/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/user-roles/${id}`, { method: 'DELETE', token }),
};
