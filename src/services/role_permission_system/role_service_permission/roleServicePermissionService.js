import { apiFetch } from '../../apiClient';

export const roleServicePermissionService = {
  list: (token, params) => apiFetch('/api/v1/access/role-service-permissions', { token, params }),
  getById: (token, roleId, serviceId) => apiFetch(`/api/v1/access/role-service-permissions/${encodeURIComponent(roleId)}/${encodeURIComponent(serviceId)}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/role-service-permissions', { method: 'POST', token, body }),
  update: (token, roleId, serviceId, body) => apiFetch(`/api/v1/access/role-service-permissions/${encodeURIComponent(roleId)}/${encodeURIComponent(serviceId)}`, { method: 'PUT', token, body }),
  remove: (token, roleId, serviceId) => apiFetch(`/api/v1/access/role-service-permissions/${encodeURIComponent(roleId)}/${encodeURIComponent(serviceId)}`, { method: 'DELETE', token }),
};
