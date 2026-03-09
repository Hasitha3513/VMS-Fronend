import { apiFetch } from './apiClient';

export const uiPreferenceService = {
  getOpenInNewTab: (token) => apiFetch('/api/v1/access/ui-preferences/open-in-new-tab', { token }),
  setOpenInNewTab: (token, openInNewTab) => apiFetch('/api/v1/access/ui-preferences/open-in-new-tab', {
    method: 'PUT',
    token,
    body: { openInNewTab },
  }),
};
