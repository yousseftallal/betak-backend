const { Op } = require('sequelize');
const { AdminActivityLog, Admin } = require('../../database/models');

/**
 * List Admin Logs
 * GET /api/v1/admin/logs
 */
async function listLogs(req, res) {
  try {
    const { page = 1, limit = 20, admin_id, action, type, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (admin_id) where.admin_id = admin_id;
    // Use partial match (iLike for PG, Like for others - using like with lower logic if needed, but simple Like is good start)
    // Assuming Postgres based on previous context, but Op.like is safer if unsure.
    if (action) where.action = { [Op.like]: `%${action}%` }; 
    if (type) where.resource_type = { [Op.like]: `%${type}%` };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    const { count, rows } = await AdminActivityLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { 
          model: Admin, 
          as: 'admin', // Ensure association exists in models
          attributes: ['id', 'username', 'email'] 
        }
      ]
    });

    return res.json({
      success: true,
      data: {
        rows: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('List Logs Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to fetch admin logs' } 
    });
  }
}

/**
 * Get Realtime Dashboard Stats (Mock)
 * GET /api/v1/admin/stats/realtime
 */
async function getRealtimeStats(req, res) {
  try {
    // Mock Data for now
    const activeUsers = Math.floor(Math.random() * 50) + 1200; // 1200-1250 active
    const activeStreams = Math.floor(Math.random() * 5) + 40; // 40-45 streams
    
    return res.json({
      success: true,
      data: {
        active_users: activeUsers,
        active_streams: activeStreams,
        cpu_load: Math.floor(Math.random() * 20) + 10 + '%',
        server_time: new Date()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch realtime stats' });
  }
}

module.exports = {
  listLogs,
  getRealtimeStats
};
