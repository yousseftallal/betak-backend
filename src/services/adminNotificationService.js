const { AdminNotification, Admin } = require('../database/models');

/**
 * Service to handle creating notifications for admins
 */
const adminNotificationService = {
  /**
   * Create a notification for all admins (or specific one)
   * @param {Object} data
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification body
   * @param {string} [data.type='info'] - 'info', 'success', 'warning', 'error'
   * @param {string} [data.link] - Optional link to related resource
   * @param {number} [data.adminId] - Specific admin ID (null for broadcast)
   */
  notify: async ({ title, message, type = 'info', link = null, adminId = null }) => {
    try {
      if (adminId) {
          // Single Admin
          await AdminNotification.create({
            admin_id: adminId,
            title,
            message,
            type,
            link,
            is_read: false
          });
      } else {
          // Broadcast: Create copy for ALL admins to ensure individual read status
          const admins = await Admin.findAll({ attributes: ['id'] });
          const notifications = admins.map(admin => ({
              admin_id: admin.id,
              title,
              message,
              type,
              link,
              is_read: false
          }));
          
          if (notifications.length > 0) {
              await AdminNotification.bulkCreate(notifications);
          }
      }
      // In a real-time app, here we would also emit a socket event
    } catch (error) {
      console.error('Failed to create admin notification:', error);
      // We don't throw here to prevent breaking the main flow if notification fails
    }
  },

  /**
   * Helper specifically for Financial Actions
   */
  notifyFinancialAction: async ({ action, performedBy, details, link = null }) => {
    const title = `Financial Action: ${action}`;
    const message = `Action performed by ${performedBy || 'Unknown'}. ${details}`;
    
    await adminNotificationService.notify({
      title,
      message,
      type: 'info',
      link
    });
  }
};

module.exports = adminNotificationService;
