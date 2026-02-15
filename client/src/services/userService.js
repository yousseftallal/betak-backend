import api from './api';

export const userService = {
  // Get users with pagination, search, and filters
  getUsers: async (params = {}) => {
    // params: page, limit, search, status, country, sort
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/users?${query}`);
    return response.data;
  },

  getUserDetails: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  banUser: async (id, reason) => {
    const response = await api.post(`/users/${id}/ban`, { reason });
    return response.data;
  },

  restoreUser: async (id) => {
    const response = await api.post(`/users/${id}/restore`);
    return response.data;
  },

  suspendUser: async (id, duration, reason) => {
    const response = await api.post(`/users/${id}/suspend`, { duration, reason });
    return response.data;
  },

  banFromLive: async (id, duration, reason) => {
    const response = await api.post(`/users/${id}/live-ban`, { duration_hours: duration, reason });
    return response.data;
  },

  getUsersBySegment: async (segmentType) => {
    const response = await api.get(`/users/segment?type=${segmentType}`);
    return response.data;
  }
};
