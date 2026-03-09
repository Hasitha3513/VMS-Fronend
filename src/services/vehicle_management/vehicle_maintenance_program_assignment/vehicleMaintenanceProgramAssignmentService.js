import { apiFetch } from '../../apiClient';

export const vehicleMaintenanceProgramAssignmentService = {
  list: (token, params) => apiFetch('/api/v1/vehicles/vehicle-maintenance-program-assignments', { token, params }),
  getById: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-maintenance-program-assignments/${id}`, { token }),
  create: (token, body) => apiFetch('/api/v1/vehicles/vehicle-maintenance-program-assignments', { method: 'POST', token, body }),
  update: (token, id, body) => apiFetch(`/api/v1/vehicles/vehicle-maintenance-program-assignments/${id}`, { method: 'PUT', token, body }),
  delete: (token, id) => apiFetch(`/api/v1/vehicles/vehicle-maintenance-program-assignments/${id}`, { method: 'DELETE', token }),
};
