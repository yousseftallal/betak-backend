import api from './api';

const liveService = {
  // Get all active streams
  getStreams: async () => {
    const response = await api.get('/live');
    return response.data;
  },

  // End a stream
  endStream: async (id) => {
    const response = await api.post(`/live/${id}/end`);
    return response.data;
  },

  // Ban user from live streaming
  banUser: async (id, duration) => {
    // duration: '24h', '3d', '1w', '1m', 'permanent'
    const response = await api.post(`/live/${id}/ban`, { duration });
    return response.data;
  }
};

export default liveService;
