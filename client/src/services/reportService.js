import api from './api';

export const reportService = {
  // Get reports with filters
  getReports: async (params = {}) => {
    // params: page, limit, status, type, priority
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/reports?${query}`);
    return response.data;
  },

  // Get single report details including content
  getReportDetails: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Moderation Actions
  resolveReport: async (id, action, notes) => {
    // action: 'ban_user', 'delete_content', 'warning', 'ignore'
    
    // Map frontend action to backend status/action
    let status = 'resolved';
    if (action === 'ignore') status = 'ignored';

    const response = await api.post(`/reports/${id}/status`, { 
        status: status,
        action_taken: action, 
        resolution_notes: notes 
    });
    return response.data;
  },

  dismissReport: async (id) => {
    const response = await api.post(`/reports/${id}/status`, { status: 'ignored' });
    return response.data;
  }
};
