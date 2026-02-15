const Joi = require('joi');
const { Op } = require('sequelize');
const { User, Video, Report, Role, Permission } = require('../../database/models');

/**
 * Get All Users (with pagination & search)
 * GET /api/v1/admin/users
 */
/**
 * Get All Users (with pagination & search)
 * GET /api/v1/admin/users
 */
async function listUsers(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      role, 
      verified, 
      date_from, 
      date_to,
      sort = 'newest' 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 1. Search (Username, Email, Phone)
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
      // Numeric Search (ID)
      if (!isNaN(search)) {
          where[Op.or].push({ id: parseInt(search) });
      }
    }

    // 2. Status Filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // 3. Role Filter
    if (role && role !== 'all') {
      // Assuming role is passed as ID or Name. 
      // If ID: where.role_id = role
      // If Name: we need to join Role table. simpler to pass ID from frontend.
      // Let's assume frontend sends ID or name mapped to ID.
      // For now, let's try direct mapping if numeric, else ignore or lookup
      if (!isNaN(role)) where.role_id = parseInt(role);
    }

    // 4. Verification Filter
    if (verified === 'true') where.is_verified = true;
    if (verified === 'false') where.is_verified = false;

    // 5. Date Range Filter (Created At)
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999); // End of day
        where.created_at[Op.lte] = endDate;
      }
    }

    // 4. Country Filter
    if (req.query.country && req.query.country !== 'all') {
      where.country = { [Op.iLike]: req.query.country }; 
    }

    // Sort Order
    let order = [['created_at', 'DESC']];
    if (sort === 'oldest') order = [['created_at', 'ASC']];
    if (sort === 'most_followed') order = [['followers_count', 'DESC']];
    if (sort === 'most_videos') order = [['videos_count', 'DESC']];

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name', 'description'] }
      ]
    });

    return res.json({
      success: true,
      data: {
        rows: rows,
        count: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('List Users Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch users' } });
  }
}

/**
 * Get Single User Details
 * GET /api/v1/admin/users/:id
 */
async function getUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { 
          model: Video, 
          as: 'videos', 
          limit: 5,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'title', 'thumbnail_url', 'views_count', 'status']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Get stats from other tables if needed (e.g., report count)
    const reportCount = await Report.count({ where: { reported_id: id, reported_type: 'user' } });
    
    return res.json({
      success: true,
      data: {
        user: {
          ...user.toJSON(),
          report_count: reportCount
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch user details' } });
  }
}

/**
 * Suspend User
 * POST /api/v1/admin/users/:id/suspend
 */
async function suspendUser(req, res) {
  try {
    const { id } = req.params;
    const { reason, duration_days } = req.body; // Validation needed

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    // Calculate ban expiry if temporary
    // For now, we just update status
    await user.update({ 
      status: 'suspended',
      suspension_expires_at: duration_days ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000) : null
    });

    // Log action (Implementation pending for ActivityLog wrapper)
    
    return res.json({
      success: true,
      message: `User ${user.username} has been suspended`,
      data: { userId: user.id, status: 'suspended' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to suspend user' } });
  }
}

/**
 * Ban User (Permanent)
 * POST /api/v1/admin/users/:id/ban
 */
async function banUser(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    await user.update({ status: 'banned' });

    return res.json({
      success: true,
      message: `User ${user.username} has been permanently banned`,
      data: { userId: user.id, status: 'banned' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to ban user' } });
  }
}

/**
 * Restore User (Unban/Unsuspend)
 * POST /api/v1/admin/users/:id/restore
 */
async function restoreUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    await user.update({ 
      status: 'active',
      suspension_expires_at: null,
      live_ban_expires_at: null
    });

    return res.json({
      success: true,
      message: `User ${user.username} has been restored`,
      data: { userId: user.id, status: 'active' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to restore user' } });
  }
}

/**
 * Ban User from Live Streaming
 * POST /api/v1/admin/users/:id/live-ban
 */
async function banFromLive(req, res) {
  try {
    const { id } = req.params;
    const { duration_hours, reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const expiresAt = duration_hours 
      ? new Date(Date.now() + duration_hours * 60 * 60 * 1000) 
      : null; // Permanent if not specified? Or default 24h? Let's assume indefinite if null, or require duration.

    await user.update({ 
      live_ban_expires_at: expiresAt 
    });

    return res.json({
      success: true,
      message: `User ${user.username} has been banned from going live`,
      data: { userId: user.id, live_ban_expires_at: expiresAt }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to ban user from live' } });
  }
}

/**
 * Get Users by Segment (for Push Targeting)
 * GET /api/v1/admin/users/segment
 */
async function getUsersBySegment(req, res) {
  try {
    const { type } = req.query; // verification_pending, payment_failed, payment_success
    let where = {};
    let include = [];

    if (type === 'verification_pending') {
      // Users with pending verification requests
      include.push({
        model: require('../../database/models').VerificationRequest,
        as: 'verificationRequests',
        where: { status: 'pending' },
        required: true // INNER JOIN
      });
    } else if (type === 'payment_failed') {
      // Users with failed charge requests
      include.push({
        model: require('../../database/models').ChargeRequest,
        as: 'chargeRequests',
        where: { status: 'failed' },
        required: true
      });
    } else if (type === 'payment_success') {
         // Users with successful charge requests
      include.push({
        model: require('../../database/models').ChargeRequest,
        as: 'chargeRequests',
        where: { status: 'completed' }, // Assuming 'completed' is the success status
        required: true
      });
    } else {
        return res.status(400).json({ success: false, message: 'Invalid segment type' });
    }

    const users = await User.findAll({
      where,
      include,
      attributes: ['id', 'username', 'email']
    });

    const userIds = users.map(u => u.id);

    return res.json({
      success: true,
      data: {
        count: userIds.length,
        userIds,
        users // Optional: return basic info if needed for UI
      }
    });

  } catch (error) {
    console.error('Get Segment Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch segment users' } });
  }
}

module.exports = {
  listUsers,
  getUser,
  suspendUser,
  banUser,
  restoreUser,
  getUsersBySegment,
  banFromLive
};
