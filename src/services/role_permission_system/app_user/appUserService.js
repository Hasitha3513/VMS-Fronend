import { apiFetch } from '../../apiClient';

export const appUserService = {
  list: (token, params) => apiFetch('/api/v1/access/app-users', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/app-users/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/app-users', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/app-users/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/app-users/${id}`, { method: 'DELETE', token }),
  verifyPassword: (token, id, password) =>
    apiFetch(`/api/v1/access/app-users/${id}/password/verify`, {
      method: 'POST',
      token,
      body: { password },
    }),
  resetPassword: (token, id, newPassword) =>
    apiFetch(`/api/v1/access/app-users/${id}/password/reset`, {
      method: 'POST',
      token,
      body: { newPassword },
    }),
};
