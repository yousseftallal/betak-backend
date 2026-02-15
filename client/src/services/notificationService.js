import api from './api';

const notificationService = {
  // Push Campaigns (for Notifications Page)
  getCampaigns: async () => {
    const response = await api.get('/notifications/campaigns');
    return response.data;
  },

  createCampaign: async (data) => {
    const response = await api.post('/notifications/campaigns', data);
    return response.data;
  },

  // Admin Alerts (for Header/Global)
  getAlerts: async () => {
    const response = await api.get('/notifications/alerts');
    return response.data;
  },

  // Mark all as read
  markAlertsRead: async () => {
    return api.patch('/notifications/read-all');
  },

  // Mark single as read
  markOneRead: async (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  createAdminAlert: async (title, message, type = 'info') => {
    const response = await api.post('/notifications/alerts', { title, message, type });
    return response.data;
  }
};

export default notificationService;
