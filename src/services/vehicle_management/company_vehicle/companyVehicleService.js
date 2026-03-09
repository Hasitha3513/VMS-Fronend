import { apiFetch } from '../../apiClient';

export const companyVehicleService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/company-vehicles/list', { token, params }),
  first: (token, companyId) => apiFetch('/api/v1/vehicles/company-vehicles/first', { token, params: companyId ? { companyId } : {} }),
  overview: (token, companyId) => apiFetch('/api/v1/vehicles/company-vehicles/overview', { token, params: companyId ? { companyId } : {} }),
  nextIdentification: (token, companyId, typeId) => apiFetch('/api/v1/vehicles/company-vehicles/next-identification', { token, params: { companyId, typeId } }),
  ownershipTypeOptions: (token) => apiFetch('/api/v1/vehicles/company-vehicles/ownership-type-options', { token }),
  currentOwnershipOptions: (token, params) => apiFetch('/api/v1/vehicles/company-vehicles/current-ownership-options', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/company-vehicles/${id}`, { token }),
  qrById: (token, id) => apiFetch(`/api/v1/vehicles/company-vehicles/${id}/qr`, { token }),
  resolveQr: (token, value) => apiFetch('/api/v1/vehicles/company-vehicles/qr/resolve', { token, params: { value } }),
  resolveQrPost: (token, value) => apiFetch('/api/v1/vehicles/company-vehicles/qr/resolve', { method: 'POST', token, body: { value } }),
  create: (token, body) => apiFetch('/api/v1/vehicles/company-vehicles', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/company-vehicles/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/company-vehicles/${id}`, { method: 'DELETE', token }),
};
