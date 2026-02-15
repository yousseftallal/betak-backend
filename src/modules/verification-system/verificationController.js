const { VerificationRequest, User, Admin, AdminNotification } = require('../../database/models');

const verificationController = {
  // Create Request (Public)
  createVerification: async (req, res) => {
    try {
      const { document_url, type, notes } = req.body;

      const request = await VerificationRequest.create({
        user_id: req.user.id,
        document_url,
        type: type || 'identity',
        status: 'pending',
        created_at: new Date()
      });

      // Notify Admins
      await AdminNotification.create({
        admin_id: null,
        title: 'New Verification Request',
        message: `User ${req.user.username} requested verification.`,
        type: 'verification_request'
      });

      res.status(201).json({ success: true, message: 'Verification requested', data: request });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // Get all requests
  listRequests: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (status && status !== 'all') whereClause.status = status;

      const requests = await VerificationRequest.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { 
            model: User, 
            as: 'user',
            attributes: ['id', 'username', 'email', 'avatar_url', 'followers_count']
          },
          {
            model: Admin,
            as: 'reviewer',
            attributes: ['id', 'username']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: requests.rows,
        pagination: {
          total: requests.count,
          page: parseInt(page),
          pages: Math.ceil(requests.count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update request status
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const adminId = req.user.id; // Assumes auth middleware populates req.user

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const request = await VerificationRequest.findByPk(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      request.status = status;
      request.admin_notes = notes;
      request.reviewed_by = adminId;
      request.reviewed_at = new Date();
      await request.save();

      // If approved, update User model is_verified
      if (status === 'approved') {
        await User.update({ is_verified: true }, { where: { id: request.user_id } });
      } else if (status === 'rejected' && request.status === 'approved') {
        // If revoking approval
         await User.update({ is_verified: false }, { where: { id: request.user_id } });
      }

      res.json({ success: true, message: `Request ${status}`, data: request });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Get stats
  getStats: async (req, res) => {
      try {
          const totalVerified = await User.count({ where: { is_verified: true }});
          const pending = await VerificationRequest.count({ where: { status: 'pending' }});
          
          // Approved today
          const startOfDay = new Date();
          startOfDay.setHours(0,0,0,0);
          
          const approvedToday = await VerificationRequest.count({
              where: {
                  status: 'approved',
                  updated_at: {
                      [require('sequelize').Op.gte]: startOfDay
                  }
              }
          });
          
          res.json({
              success: true,
              data: {
                  totalVerified,
                  pending,
                  approvedToday
              }
          });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  }
};

  module.exports = verificationController;
