import { apiFetch } from '../../apiClient';

export const employeeDetailsService = {
  listEmployeeEducations: (token, params) => apiFetch('/api/v1/hr/employee-details/employee-educations', { token, params }),
  getEmployeeEducationById: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-educations/${id}`, { token }),
  createEmployeeEducation: (token, body) => apiFetch('/api/v1/hr/employee-details/employee-educations', { method: 'POST', token, body }),
  updateEmployeeEducation: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/employee-educations/${id}`, { method: 'PUT', token, body }),
  deleteEmployeeEducation: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-educations/${id}`, { method: 'DELETE', token }),

  listEmployeeSkillAssessments: (token, params) => apiFetch('/api/v1/hr/employee-details/employee-skill-assessments', { token, params }),
  getEmployeeSkillAssessmentById: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-skill-assessments/${id}`, { token }),
  createEmployeeSkillAssessment: (token, body) => apiFetch('/api/v1/hr/employee-details/employee-skill-assessments', { method: 'POST', token, body }),
  updateEmployeeSkillAssessment: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/employee-skill-assessments/${id}`, { method: 'PUT', token, body }),
  deleteEmployeeSkillAssessment: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-skill-assessments/${id}`, { method: 'DELETE', token }),

  listEmployeeDocuments: (token, params) => apiFetch('/api/v1/hr/employee-details/employee-documents', { token, params }),
  getEmployeeDocumentById: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-documents/${id}`, { token }),
  createEmployeeDocument: (token, body) => apiFetch('/api/v1/hr/employee-details/employee-documents', { method: 'POST', token, body }),
  updateEmployeeDocument: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/employee-documents/${id}`, { method: 'PUT', token, body }),
  deleteEmployeeDocument: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-documents/${id}`, { method: 'DELETE', token }),

  listProjectMembers: (token, params) => apiFetch('/api/v1/hr/employee-details/project-members', { token, params }),
  getProjectMemberById: (token, id) => apiFetch(`/api/v1/hr/employee-details/project-members/${id}`, { token }),
  createProjectMember: (token, body) => apiFetch('/api/v1/hr/employee-details/project-members', { method: 'POST', token, body }),
  updateProjectMember: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/project-members/${id}`, { method: 'PUT', token, body }),
  deleteProjectMember: (token, id) => apiFetch(`/api/v1/hr/employee-details/project-members/${id}`, { method: 'DELETE', token }),

  listEmployeeTrainingRecords: (token, params) => apiFetch('/api/v1/hr/employee-details/employee-training-records', { token, params }),
  getEmployeeTrainingRecordById: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-training-records/${id}`, { token }),
  createEmployeeTrainingRecord: (token, body) => apiFetch('/api/v1/hr/employee-details/employee-training-records', { method: 'POST', token, body }),
  updateEmployeeTrainingRecord: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/employee-training-records/${id}`, { method: 'PUT', token, body }),
  deleteEmployeeTrainingRecord: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-training-records/${id}`, { method: 'DELETE', token }),

  listEmployeeComplaints: (token, params) => apiFetch('/api/v1/hr/employee-details/employee-complaints', { token, params }),
  getEmployeeComplaintById: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-complaints/${id}`, { token }),
  createEmployeeComplaint: (token, body) => apiFetch('/api/v1/hr/employee-details/employee-complaints', { method: 'POST', token, body }),
  updateEmployeeComplaint: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/employee-complaints/${id}`, { method: 'PUT', token, body }),
  deleteEmployeeComplaint: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-complaints/${id}`, { method: 'DELETE', token }),

  listEmployeePerformanceReviews: (token, params) => apiFetch('/api/v1/hr/employee-details/employee-performance-reviews', { token, params }),
  getEmployeePerformanceReviewById: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-performance-reviews/${id}`, { token }),
  createEmployeePerformanceReview: (token, body) => apiFetch('/api/v1/hr/employee-details/employee-performance-reviews', { method: 'POST', token, body }),
  updateEmployeePerformanceReview: (token, id, body) => apiFetch(`/api/v1/hr/employee-details/employee-performance-reviews/${id}`, { method: 'PUT', token, body }),
  deleteEmployeePerformanceReview: (token, id) => apiFetch(`/api/v1/hr/employee-details/employee-performance-reviews/${id}`, { method: 'DELETE', token }),
};

