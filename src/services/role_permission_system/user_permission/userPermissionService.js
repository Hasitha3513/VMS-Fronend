import { apiFetch } from '../../apiClient';

export const userPermissionService = {
  list: (token, params) => apiFetch('/api/v1/access/user-permissions', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/user-permissions/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/user-permissions', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/user-permissions/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/user-permissions/${id}`, { method: 'DELETE', token }),
};
