import api from './api';

export const analyticsService = {
  // Get dashboard overview stats (counters)
  getOverview: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  // Get revenue statistics
  getRevenueStats: async () => {
    const response = await api.get('/stats/revenue');
    return response.data;
  },

  // Get daily stats history
  getDailyStats: async (limit = 30) => {
    const response = await api.get(`/stats/daily?limit=${limit}`);
    return response.data;
  },

  // Get peak activity hours
  getPeakHours: async () => {
    const response = await api.get('/stats/peak-hours');
    return response.data;
  },

  // Get user demographics (by country)
  getDemographics: async (limit = 5) => {
    const response = await api.get(`/stats/demographics?limit=${limit}`);
    return response.data;
  },

  // Get trending creators
  getTrendingCreators: async () => {
    const response = await api.get('/stats/trending-creators');
    return response.data;
  }
};
