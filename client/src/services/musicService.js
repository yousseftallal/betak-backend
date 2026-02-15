import api from './api';

const musicService = {
  // Get all sounds
  getSounds: async (params = {}) => {
      // params: page, limit, search, filter (trending, flagged)
      const response = await api.get('/music', { params });
      return response.data;
  },

  // Get stats
  getStats: async () => {
      const response = await api.get('/music/stats');
      return response.data;
  },

  // Toggle status (flagged/trending)
  toggleStatus: async (id, data) => {
      const response = await api.put(`/music/${id}`, data);
      return response.data;
  },

  // Upload sound
  uploadSound: async (formData) => {
      const response = await api.post('/music', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      return response.data;
  }
};

export default musicService;
