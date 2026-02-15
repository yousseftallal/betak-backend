import api from './api';

export const creatorService = {
  // Get detailed creator analytics
  getAnalytics: async (period = '30d') => {
    const response = await api.get(`/creators/analytics?period=${period}`);
    return response.data;
  },

  // Get top performing creators
  getTopCreators: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/creators/top?${query}`);
    return response.data;
  },

  // Get list of creators
  getCreators: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/creators?${query}`);
    return response.data;
  },

  // Verify Creator
  verifyCreator: async (id, status) => {
    const response = await api.post(`/creators/${id}/verify`, { status });
    return response.data;
  },

  // Get revenue stats
  getRevenueStats: async () => {
    const response = await api.get('/analytics/revenue/creators');
    return response.data;
  }
};
