import api from './api';

const verificationService = {
  // Get all verification requests
  getRequests: async (status = '') => {
      // baseURL is /api/v1/admin
      // route is /verification
      const response = await api.get('/verification', {
          params: { status, limit: 50 }
      });
      return response.data;
  },

  // Update request status (approve/reject)
  updateStatus: async (id, status, notes = '') => {
      const response = await api.put(`/verification/${id}`, { status, notes });
      return response.data;
  },

  // Get verification dashboard stats
  getStats: async () => {
      const response = await api.get('/verification/stats');
      return response.data;
  }
};

export default verificationService;
