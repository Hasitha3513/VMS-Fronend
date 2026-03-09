import { apiFetch } from '../../apiClient';

export const vehicleTransferService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/location-transfers', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/location-transfers/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/location-transfers', { method: 'POST', token, body }),
  approve: (token, id, body) => apiFetch(`/api/v1/vehicles/location-transfers/${id}/approve`, { method: 'PUT', token, body }),
  reject: (token, id, body) => apiFetch(`/api/v1/vehicles/location-transfers/${id}/reject`, { method: 'PUT', token, body }),
};
