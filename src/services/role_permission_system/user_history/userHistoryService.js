import { apiFetch } from '../../apiClient';

export const userHistoryService = {
  list: (token, params) => apiFetch('/api/v1/access/user-histories', { token, params }),
};

