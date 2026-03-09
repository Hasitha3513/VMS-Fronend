import { apiFetch } from '../../apiClient';

export const vehicleModelVariantService = {
  list: (t, p) => apiFetch('/api/v1/vehicles/model-variants', { token: t, params: p }),
  getById: (t, id) => apiFetch(`/api/v1/vehicles/model-variants/${id}`, { token: t }),
  create: (t, b) => apiFetch('/api/v1/vehicles/model-variants', { method: 'POST', token: t, body: b }),
  update: (t, id, b) => apiFetch(`/api/v1/vehicles/model-variants/${id}`, { method: 'PUT', token: t, body: b }),
  delete: (t, id) => apiFetch(`/api/v1/vehicles/model-variants/${id}`, { method: 'DELETE', token: t }),
};
