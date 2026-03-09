import { apiFetch } from '../../apiClient';

export const userDataScopeService = {
  list: (token, params) => apiFetch('/api/v1/access/user-data-scopes', { token, params }),
};
