import api from './api';

export const activityLogService = {
  // Get logs with filters
  getLogs: async (params = {}) => {
    // params: page, limit, admin_id, action, target
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/logs?${query}`);
    return response.data;
  },

  // Get distinct action types for filter dropdown
  getActionTypes: async () => {
      // If backend doesn't have a specific endpoint, we can hardcode or extract from logs
      // For now, returning common actions
      return ['LOGIN', 'BAN_USER', 'DELETE_VIDEO', 'RESOLVE_REPORT', 'UPDATE_SETTINGS'];
  }
};
