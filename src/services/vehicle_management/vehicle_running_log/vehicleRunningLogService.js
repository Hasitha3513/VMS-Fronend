import { apiFetch } from '../../apiClient';

export const vehicleRunningLogService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/running-logs', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/running-logs/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/running-logs', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/running-logs/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/running-logs/${id}`, { method: 'DELETE', token }),
  qrState: (token, params) => apiFetch('/api/v1/vehicles/running-logs/qr/state', { token, params }),
  qrDayStart: (token, body) => apiFetch('/api/v1/vehicles/running-logs/qr/day-start', { method: 'POST', token, body }),
  qrDayEnd: (token, body) => apiFetch('/api/v1/vehicles/running-logs/qr/day-end', { method: 'POST', token, body }),
};
