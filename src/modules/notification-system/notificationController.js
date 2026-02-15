const { AdminNotification, PushCampaign, User, sequelize } = require('../../database/models');
const { Op } = require('sequelize');

const notificationController = {
  // --- Admin Notifications (for the bell icon) ---
  
  // Get unread notifications for logged in admin
  getAdminNotifications: async (req, res) => {
      try {
          const adminId = req.user.id;
          const notifications = await AdminNotification.findAll({
              where: {
                  [Op.or]: [{ admin_id: adminId }, { admin_id: null }] 
              },
              order: [['created_at', 'DESC']],
              limit: 20
          });
          
          const unreadCount = await AdminNotification.count({
              where: {
                  [Op.or]: [{ admin_id: adminId }, { admin_id: null }],
                  is_read: false
              }
          });

          res.json({ success: true, data: notifications, unreadCount });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  // Mark all as read
  markAsRead: async (req, res) => {
      try {
          const adminId = req.user.id;
          await AdminNotification.update({ is_read: true }, {
              where: { admin_id: adminId, is_read: false }
          });
          res.json({ success: true });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  // Mark single as read
  markOneRead: async (req, res) => {
      try {
          const { id } = req.params;
          const adminId = req.user.id;
          
          const notification = await AdminNotification.findByPk(id);
          if (!notification) return res.status(404).json({ success: false, message: 'Not found' });

          // Assuming broad access or specific ownership check logic here
          // For now, if it's assigned to me or global
          if (notification.admin_id && notification.admin_id !== adminId) {
             return res.status(403).json({ success: false, message: 'Unauthorized' });
          }

          await notification.update({ is_read: true });
          res.json({ success: true });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  // --- Push Campaigns (for the Push Page) ---

  listCampaigns: async (req, res) => {
      try {
          const campaigns = await PushCampaign.findAll({
              order: [['created_at', 'DESC']]
          });
          res.json({ success: true, data: campaigns });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  createCampaign: async (req, res) => {
      try {
          const { title, message, target_audience, schedule } = req.body; // schedule: 'now' or 'later'
          
          const campaign = await PushCampaign.create({
              title,
              message,
              target_audience,
              status: schedule === 'now' ? 'sent' : 'scheduled',
              sent_at: schedule === 'now' ? new Date() : null,
              created_by: req.user.id
          });

          // In a real app, if sent 'now', we would trigger Firebase/OneSignal here.
          // For now, we just save the record.
          
          // Also, create a system notification for admins that a campaign was created
          await AdminNotification.create({
              admin_id: null, // Broadcast
              title: 'New Push Campaign',
              message: `Campaign "${title}" was ${schedule === 'now' ? 'sent' : 'scheduled'} by ${req.user.username}.`,
              type: 'info'
          });

          res.json({ success: true, data: campaign });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  // Helper to create admin alert (internal use mainly, but exposed endpoint for testing)
  createAdminAlert: async (req, res) => {
      try {
          const { title, message, type } = req.body;
           await AdminNotification.create({
              admin_id: null,
              title,
              message,
              type: type || 'info'
          });
          res.json({ success: true });
      } catch (error) {
           res.status(500).json({ success: false, message: error.message });
      }
  }
};

module.exports = notificationController;
