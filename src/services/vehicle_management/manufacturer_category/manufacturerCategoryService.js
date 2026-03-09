import { apiFetch } from '../../apiClient';

export const manufacturerCategoryService = {
  list: (t, p) => apiFetch('/api/v1/vehicles/manufacturer-categories', { token: t, params: p }),
  getById: (t, id) => apiFetch(`/api/v1/vehicles/manufacturer-categories/${id}`, { token: t }),
  create: (t, b) => apiFetch('/api/v1/vehicles/manufacturer-categories', { method: 'POST', token: t, body: b }),
  update: (t, id, b) => apiFetch(`/api/v1/vehicles/manufacturer-categories/${id}`, { method: 'PUT', token: t, body: b }),
  delete: (t, id) => apiFetch(`/api/v1/vehicles/manufacturer-categories/${id}`, { method: 'DELETE', token: t }),
};
