import api from './api';

export const adService = {
  getAllAds: async () => {
    const response = await api.get('/ads');
    return response.data;
  },

  createAd: async (data) => {
    const response = await api.post('/ads', data);
    return response.data;
  },

  updateAd: async (id, data) => {
    const response = await api.put(`/ads/${id}`, data);
    return response.data;
  },

  deleteAd: async (id) => {
    const response = await api.delete(`/ads/${id}`);
    return response.data;
  }
};
