import { apiFetch } from '../../apiClient';

export const userServiceAccessService = {
  list: (token, params) => apiFetch('/api/v1/access/user-service-access', { token, params }),
  users: (token, params) => apiFetch('/api/v1/access/user-service-access/users', { token, params }),
  matrix: (token, params) => apiFetch('/api/v1/access/user-service-access/matrix', { token, params }),
  replaceMatrix: (token, payload) => apiFetch('/api/v1/access/user-service-access/matrix', { method: 'PUT', token, body: payload }),
};
