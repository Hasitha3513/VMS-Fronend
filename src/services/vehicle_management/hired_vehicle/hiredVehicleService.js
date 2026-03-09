import { apiFetch } from '../../apiClient';

export const hiredVehicleService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicles/list', { token, params }),
  first: (token, supplierId) => apiFetch('/api/v1/vehicles/hired-vehicles/first', { token, params: supplierId ? { supplierId } : {} }),
  overview: (token, supplierId) => apiFetch('/api/v1/vehicles/hired-vehicles/overview', { token, params: supplierId ? { supplierId } : {} }),
  registrationOptions: (token, query, limit = 200) => apiFetch('/api/v1/vehicles/hired-vehicles/registration-options', { token, params: { query, limit } }),
  supplierOptions: (token) => apiFetch('/api/v1/vehicles/hired-vehicles/supplier-options', { token }),
  ownershipTypeOptions: (token) => apiFetch('/api/v1/vehicles/hired-vehicles/ownership-type-options', { token }),
  modelPrefill: (token, modelId, supplierId) => apiFetch('/api/v1/vehicles/hired-vehicles/model-prefill', { token, params: { modelId, supplierId } }),
  currentOwnershipOptions: (token, params) => apiFetch('/api/v1/vehicles/hired-vehicles/current-ownership-options', { token, params }),
  nextIdentification: (token, supplierId, typeId) => apiFetch('/api/v1/vehicles/hired-vehicles/next-identification', { token, params: { supplierId, typeId } }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicles/${id}`, { token }),
  getProfileById: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicles/profile/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/hired-vehicles', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/hired-vehicles/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/hired-vehicles/${id}`, { method: 'DELETE', token }),
};
