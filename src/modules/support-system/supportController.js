const { SupportTicket, User, Admin, AdminNotification } = require('../../database/models');

const supportController = {
  // Create Ticket
  createTicket: async (req, res) => {
    try {
      const { subject, message, category, priority } = req.body;

      const ticket = await SupportTicket.create({
        user_id: req.user.id,
        subject,
        message,
        category: category || 'General',
        priority: priority || 'medium',
        status: 'open',
        created_at: new Date()
      });

      // Notify Admins
      await AdminNotification.create({
        admin_id: null,
        title: 'New Support Ticket',
        message: `User ${req.user.username} created a ticket: "${subject}".`,
        type: 'support_ticket'
      });

      res.status(201).json({ success: true, message: 'Ticket created', data: ticket });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // List Tickets
  listTickets: async (req, res) => {
    try {
      const { status, priority, page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status && status !== 'all') whereClause.status = status;
      if (priority) whereClause.priority = priority;
      
      const { Op } = require('sequelize');
      if (search) {
          whereClause[Op.or] = [
              { subject: { [Op.iLike]: `%${search}%` } },
              { '$user.username$': { [Op.iLike]: `%${search}%` } } // Search by username using association
          ];
      }

      const tickets = await SupportTicket.findAndCountAll({
        where: whereClause,
        include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'email', 'avatar_url'] },
            { model: Admin, as: 'assignedAdmin', attributes: ['id', 'username'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: tickets.rows,
        pagination: {
          total: tickets.count,
          page: parseInt(page),
          pages: Math.ceil(tickets.count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get Stats
  getStats: async (req, res) => {
      try {
          // Count by status
          const totalOpen = await SupportTicket.count({ where: { status: 'open' } });
          const totalInProgress = await SupportTicket.count({ where: { status: 'in-progress' } });
          const totalClosed = await SupportTicket.count({ where: { status: 'closed' } });
          const highPriority = await SupportTicket.count({ where: { priority: 'high', status: { [require('sequelize').Op.ne]: 'closed' } } });

          res.json({
              success: true,
              data: {
                  open: totalOpen,
                  inProgress: totalInProgress,
                  closed: totalClosed,
                  highPriority
              }
          });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  // Update Ticket (Status or Assign)
  updateTicket: async (req, res) => {
      try {
          const { id } = req.params;
          const { status, priority, assigned_to } = req.body;
          
          const ticket = await SupportTicket.findByPk(id);
          if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

          if (status) ticket.status = status;
          if (priority) ticket.priority = priority;
          if (assigned_to) ticket.assigned_to = assigned_to;
          
          if (status === 'resolved' || status === 'closed') {
              // Optionally set resolved_at if we had that field
          }

          ticket.last_reply_at = new Date();
          await ticket.save();

          res.json({ success: true, message: 'Ticket updated', data: ticket });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },

  // Resolve Appeal (Auto-Unban)
  resolveAppeal: async (req, res) => {
      try {
          const { id } = req.params;
          const { action, comment } = req.body; // action: 'approve' | 'reject'
          
          const ticket = await SupportTicket.findByPk(id);
          if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

          // Update Ticket
          ticket.status = 'closed'; // Appeals are closed after decision
          ticket.last_reply_at = new Date();
          // Assuming we might have a notes field or similar, or just log it. 
          // For now, let's assume we don't store the comment in a separate message table in this snippet, 
          // or we can append to the message (not ideal). 
          // Let's just update status.
          
          if (action === 'approve') {
              // Unban User
              const user = await User.findByPk(ticket.user_id);
              if (user) {
                  await user.update({ 
                      status: 'active',
                      suspension_expires_at: null,
                      live_ban_expires_at: null
                  });
              }
          }

          await ticket.save();

          res.json({ 
              success: true, 
              message: `Appeal ${action}d. User status updated accordingly.`, 
              data: { ticketId: ticket.id, action } 
          });
      } catch (error) {
          console.error('Error resolving appeal:', error); // Log full error
          res.status(500).json({ success: false, message: error.message, error: error.toString() });
      }
  }
};

module.exports = supportController;
