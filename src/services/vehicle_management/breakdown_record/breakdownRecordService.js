import { apiFetch } from '../../apiClient';

export const breakdownRecordService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/breakdown-records', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/breakdown-records/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/breakdown-records', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/breakdown-records/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/breakdown-records/${id}`, { method: 'DELETE', token }),
};
