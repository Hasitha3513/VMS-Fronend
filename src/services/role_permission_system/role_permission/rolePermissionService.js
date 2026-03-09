import { apiFetch } from '../../apiClient';

export const rolePermissionService = {
  list: (token, params) => apiFetch('/api/v1/access/role-permissions', { token, params }),
  getById: (token, roleId, permissionId) => apiFetch(`/api/v1/access/role-permissions/${encodeURIComponent(roleId)}/${encodeURIComponent(permissionId)}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/role-permissions', { method: 'POST', token, body }),
  update: (token, roleId, permissionId, body) => apiFetch(`/api/v1/access/role-permissions/${encodeURIComponent(roleId)}/${encodeURIComponent(permissionId)}`, { method: 'PUT', token, body }),
  remove: (token, roleId, permissionId) => apiFetch(`/api/v1/access/role-permissions/${encodeURIComponent(roleId)}/${encodeURIComponent(permissionId)}`, { method: 'DELETE', token }),
};
