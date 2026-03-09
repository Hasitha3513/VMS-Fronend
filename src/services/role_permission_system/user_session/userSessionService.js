import { apiFetch } from '../../apiClient';

export const userSessionService = {
  list: (token, params) => apiFetch('/api/v1/access/user-sessions', { token, params }),
};

