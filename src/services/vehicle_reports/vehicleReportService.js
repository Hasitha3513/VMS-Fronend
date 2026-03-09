import { apiFetch } from '../apiClient';

export const vehicleReportService = {
  vehicleLicense: (token, params) => apiFetch('/api/v1/vehicles/reports/license', { token, params }),
  vehicleInsurance: (token, params) => apiFetch('/api/v1/vehicles/reports/insurance', { token, params }),
  runningDetail: (token, params) => apiFetch('/api/v1/vehicles/reports/running-details', { token, params }),
  runningDetailMonthly: (token, params) => apiFetch('/api/v1/vehicles/reports/running-details/monthly', { token, params }),
  runningDetailDayWise: (token, params) => apiFetch('/api/v1/vehicles/reports/running-details/day-wise', { token, params }),
  runningDetailVehicleOptions: (token, params) => apiFetch('/api/v1/vehicles/reports/running-details/vehicle-options', { token, params }),
  locationWise: (token, params) => apiFetch('/api/v1/vehicles/reports/location-wise', { token, params }),
  locationWiseCards: (token, params) => apiFetch('/api/v1/vehicles/reports/location-wise/cards', { token, params }),
  abnormalDetections: (token, params) => apiFetch('/api/v1/vehicles/reports/abnormal-detections', { token, params }),
  abnormalDetectionVehicleOptions: (token) => apiFetch('/api/v1/vehicles/reports/abnormal-detections/vehicle-options', { token }),
  abnormalDetectionById: (token, notificationId) => apiFetch(`/api/v1/vehicles/reports/abnormal-detections/${notificationId}`, { token }),
  abnormalDetectionRebuild: (token) => apiFetch('/api/v1/vehicles/reports/abnormal-detections/rebuild', { method: 'POST', token }),
};
