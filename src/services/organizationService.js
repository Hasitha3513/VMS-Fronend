import { apiFetch } from './apiClient';

const normalizeEnumKey = (enumKey) => {
  const normalized = String(enumKey || '').trim().toLowerCase().replace(/-/g, '_');
  const canonical = normalized === 'training_typ' ? 'training_type' : normalized;
  return encodeURIComponent(canonical);
};

export const organizationService = {
  enumValues: (enumKey, params) => apiFetch(`/api/v1/enums/${normalizeEnumKey(enumKey)}`, { params }),
  organizationLookups: (token, params) => apiFetch('/api/v1/organizations/dropdowns/core', { token, params }),
  organizationUserContextLookups: (token, params) => apiFetch('/api/v1/organizations/dropdowns/me', { token, params }),
  projectManagerOptions: (token, params) => apiFetch('/api/v1/organizations/projects/manager-options', { token, params }),
  listCompanies: (token, params) => apiFetch('/api/v1/organizations/companies', { token, params }),
  getCompanyById: (token, id) => apiFetch(`/api/v1/organizations/companies/${id}`, { token }),
  createCompany: (token, body) => apiFetch('/api/v1/organizations/companies', { method: 'POST', token, body }),
  updateCompany: (token, id, body) => apiFetch(`/api/v1/organizations/companies/${id}`, { method: 'PUT', token, body }),
  deleteCompany: (token, id) => apiFetch(`/api/v1/organizations/companies/${id}`, { method: 'DELETE', token }),
  listBranches: (token, params) => apiFetch('/api/v1/organizations/branches', { token, params }),
  getBranchById: (token, id) => apiFetch(`/api/v1/organizations/branches/${id}`, { token }),
  createBranch: (token, body) => apiFetch('/api/v1/organizations/branches', { method: 'POST', token, body }),
  updateBranch: (token, id, body) => apiFetch(`/api/v1/organizations/branches/${id}`, { method: 'PUT', token, body }),
  deleteBranch: (token, id) => apiFetch(`/api/v1/organizations/branches/${id}`, { method: 'DELETE', token }),
  listDepartments: (token, params) => apiFetch('/api/v1/organizations/departments', { token, params }),
  getDepartmentById: (token, id) => apiFetch(`/api/v1/organizations/departments/${id}`, { token }),
  createDepartment: (token, body) => apiFetch('/api/v1/organizations/departments', { method: 'POST', token, body }),
  updateDepartment: (token, id, body) => apiFetch(`/api/v1/organizations/departments/${id}`, { method: 'PUT', token, body }),
  deleteDepartment: (token, id) => apiFetch(`/api/v1/organizations/departments/${id}`, { method: 'DELETE', token }),
  listProjects: (token, params) => apiFetch('/api/v1/organizations/projects', { token, params }),
  getProjectById: (token, id) => apiFetch(`/api/v1/organizations/projects/${id}`, { token }),
  createProject: (token, body) => apiFetch('/api/v1/organizations/projects', { method: 'POST', token, body }),
  updateProject: (token, id, body) => apiFetch(`/api/v1/organizations/projects/${id}`, { method: 'PUT', token, body }),
  deleteProject: (token, id) => apiFetch(`/api/v1/organizations/projects/${id}`, { method: 'DELETE', token }),
  listWorkshops: (token, params) => apiFetch('/api/v1/organizations/workshops', { token, params }),
  getWorkshopById: (token, id) => apiFetch(`/api/v1/organizations/workshops/${id}`, { token }),
  createWorkshop: (token, body) => apiFetch('/api/v1/organizations/workshops', { method: 'POST', token, body }),
  updateWorkshop: (token, id, body) => apiFetch(`/api/v1/organizations/workshops/${id}`, { method: 'PUT', token, body }),
  deleteWorkshop: (token, id) => apiFetch(`/api/v1/organizations/workshops/${id}`, { method: 'DELETE', token }),
};
