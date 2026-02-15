import api from './api';

export const videoService = {
  // Get videos with filters
  getVideos: async (params = {}) => {
    // params: page, limit, search, status, sort (views_desc, reports_desc)
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/videos?${query}`);
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },

  hideVideo: async (id) => {
    const response = await api.post(`/videos/${id}/hide`); // Soft delete or status update
    return response.data;
  },

  featureVideo: async (id) => {
    const response = await api.post(`/videos/${id}/feature`);
    return response.data;
  },

  uploadVideo: async (formData) => {
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Public User Upload
  uploadUserVideo: async (formData) => {
      const token = localStorage.getItem('token');
      // Import axios here or use a new instance if needed, but simplest is raw axios call
      // to avoid /admin prefix
      const axios = require('axios'); 
      const response = await axios.post('http://localhost:3000/api/v1/videos/upload', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
          }
      });
      return response.data;
  }
};
