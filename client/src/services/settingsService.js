import api from './api';

export const settingsService = {
  // Get all system settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update specific settings
  updateSettings: async (updates) => {
    // updates is { key: value, ... }
    const response = await api.patch('/settings', updates);
    return response.data;
  },

  // Trigger Backup
  triggerBackup: async () => {
    const response = await api.post('/settings/backup');
    return response.data; // Expect { success: true, data: { downloadUrl } }
  }
};
