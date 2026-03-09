import { apiFetch } from '../../apiClient';

export const roleHierarchyService = {
  list: (token, params) => apiFetch('/api/v1/access/role-hierarchies', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/role-hierarchies/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/role-hierarchies', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/role-hierarchies/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/role-hierarchies/${id}`, { method: 'DELETE', token }),
};
