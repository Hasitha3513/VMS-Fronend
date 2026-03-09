import { apiFetch } from './apiClient';

export const lookupAdminService = {
  listEnumDefinitions: (token) => apiFetch('/api/v1/enums', { token }),
  listRecords: (token, enumKey, params) => apiFetch(`/api/v1/enums/${encodeURIComponent(enumKey)}/records`, { token, params }),
  getRecordById: (token, enumKey, id) => apiFetch(`/api/v1/enums/${encodeURIComponent(enumKey)}/records/${id}`, { token }),
  createRecord: (token, enumKey, body) => apiFetch(`/api/v1/enums/${encodeURIComponent(enumKey)}/records`, { method: 'POST', token, body }),
  updateRecord: (token, enumKey, id, body) => apiFetch(`/api/v1/enums/${encodeURIComponent(enumKey)}/records/${id}`, { method: 'PUT', token, body }),
  deleteRecord: (token, enumKey, id) => apiFetch(`/api/v1/enums/${encodeURIComponent(enumKey)}/records/${id}`, { method: 'DELETE', token }),
};

