import { apiFetch } from '../../apiClient';

export const loginHistoryService = {
  list: (token, params) => apiFetch('/api/v1/access/login-histories', { token, params }),
};

