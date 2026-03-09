import { apiFetch } from '../../apiClient';

export const systemServiceService = {
  list: (token, params) => apiFetch('/api/v1/access/system-services', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/access/system-services/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/access/system-services', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/access/system-services/${id}`, { method: 'PUT', token, body }),
  remove: (token, id) => apiFetch(`/api/v1/access/system-services/${id}`, { method: 'DELETE', token }),
};
