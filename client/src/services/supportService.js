import api from './api';

const supportService = {
  // Get all support tickets
  getTickets: async (params = {}) => {
      // params: status, priority, page, limit, search
      const response = await api.get('/support', { params });
      return response.data;
  },

  // Update ticket (status, priority, assign)
  updateTicket: async (id, data) => {
      const response = await api.put(`/support/${id}`, data);
      return response.data;
  },

  // Get support dashboard stats
  getStats: async () => {
      const response = await api.get('/support/stats');
      return response.data;
  },

  resolveAppeal: async (id, action, comment) => {
    const response = await api.post(`/support/tickets/${id}/resolve-appeal`, { action, comment });
    return response.data;
  }
};

export default supportService;
