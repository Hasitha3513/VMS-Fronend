import { apiFetch } from './apiClient';

export const authService = {
  login: (payload) => apiFetch('/api/v1/auth/login', { method: 'POST', body: payload }),
  logout: (token, reason = 'LOGOUT') => apiFetch('/api/v1/auth/logout', { method: 'POST', token, body: { reason } }),
  ping: (token) => apiFetch('/api/v1/auth/ping', { method: 'POST', token }),
  changePassword: (token, payload) => apiFetch('/api/v1/auth/change-password', { method: 'POST', token, body: payload }),
  resetPassword: (token, payload) => apiFetch('/api/v1/auth/admin/reset-password', { method: 'POST', token, body: payload })
};
