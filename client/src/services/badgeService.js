import api from './api';

export const badgeService = {
  getBadges: async () => {
    const response = await api.get('/badges');
    return response.data;
  },

  createBadge: async (data) => {
    const response = await api.post('/badges', data);
    return response.data;
  },

  awardBadge: async (userId, badgeId, reason) => {
    const response = await api.post('/badges/award', { user_id: userId, badge_id: badgeId, reason });
    return response.data;
  },

  revokeBadge: async (userId, badgeId) => {
    const response = await api.post('/badges/revoke', { user_id: userId, badge_id: badgeId });
    return response.data;
  }
};
