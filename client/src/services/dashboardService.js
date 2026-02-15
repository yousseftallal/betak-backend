import api from './api';

export const dashboardService = {
  getOverview: async () => {
    // Fetches counters: users, videos, creators, reports
    const response = await api.get('/stats/overview');
    return response.data;
  },

  getDailyStats: async (days = 7) => {
    // Fetches historical data for charts
    const response = await api.get(`/stats/daily?days=${days}`);
    return response.data;
  },
  
  // New: Get trending creators
  getTrendingCreators: async () => {
      const response = await api.get('/creators?sort=followers_desc&limit=5');
      return response.data;
  },

  // New: Get Real-time Stats
  getRealtimeStats: async () => {
    const response = await api.get('/stats/realtime');
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
      const response = await api.get('/settings');
      return response.data;
  },

  updateSystemSettings: async (settings) => {
      const response = await api.patch('/settings', settings);
      return response.data;
  }
};
