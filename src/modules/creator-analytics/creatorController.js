const { Op } = require('sequelize');
const { Creator, User, CreatorRevenue, CreatorDailyActivity, Video } = require('../../database/models');

/**
 * List Creators (Filtered & Sorted)
 * GET /api/v1/admin/creators
 */
async function listCreators(req, res) {
  try {
    const { page = 1, limit = 10, search, sort = 'engagement' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.username = { [Op.iLike]: `%${search}%` };
    }

    let order = [['engagement_rate', 'DESC']];
    if (sort === 'revenue') order = [['revenue_earned', 'DESC']];
    if (sort === 'followers') order = [['followers_count', 'DESC']];
    if (sort === 'videos') order = [['total_videos', 'DESC']];

    const { count, rows } = await Creator.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        { model: User, as: 'user', attributes: ['id', 'status', 'avatar_url', 'is_verified'] }
      ]
    });

    return res.json({
      success: true,
      data: {
        creators: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch creators' } });
  }
}

/**
 * Get Creator Profile & Detailed Stats
 * GET /api/v1/admin/creators/:id
 */
async function getCreatorDetails(req, res) {
  try {
    const { id } = req.params;

    const creator = await Creator.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['email', 'phone', 'status', 'avatar_url', 'bio'] },
        // Last 7 days activity
        { 
          model: CreatorDailyActivity, 
          as: 'dailyActivities', 
          limit: 7, 
          order: [['date', 'DESC']] 
        }
      ]
    });

    if (!creator) return res.status(404).json({ success: false, error: { message: 'Creator not found' } });

    // Get Top Performing Videos
    const topVideos = await Video.findAll({
      where: { user_id: creator.user_id, status: 'active' },
      order: [['views_count', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'thumbnail_url', 'views_count', 'likes_count', 'engagement_rate'] // Assuming logic or virtual field
    });

    return res.json({
      success: true,
      data: {
        creator,
        top_videos: topVideos
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch creator details' } });
  }
}

/**
 * Get Creator Revenue History
 * GET /api/v1/admin/creators/:id/revenue
 */
async function getCreatorRevenue(req, res) {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query; // Could filter by date

    const revenue = await CreatorRevenue.findAll({
      where: { creator_id: id },
      order: [['created_at', 'DESC']],
      limit: 100 // Pagination needed in real app
    });

    const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return res.json({
      success: true,
      data: {
        total_revenue: totalRevenue.toFixed(2),
        history: revenue
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch revenue' } });
  }
}

/**
 * Get Creator Daily Activity History
 * GET /api/v1/admin/creators/:id/daily-activity
 */
async function getCreatorDailyActivity(req, res) {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const activity = await CreatorDailyActivity.findAll({
      where: { creator_id: id },
      order: [['date', 'DESC']],
      limit: parseInt(days)
    });

    return res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch daily activity' } });
  }
}

/**
 * Get Top Creators (Quick Filter)
 * GET /api/v1/admin/creators/top
 */
async function getTopCreators(req, res) {
  try {
    const { limit = 5, criterion = 'revenue' } = req.query; // revenue, engagement, growth

    let order = [['revenue_earned', 'DESC']];
    if (criterion === 'engagement') order = [['engagement_rate', 'DESC']];
    // Growth logic would need historical data comparison, for now using followers count as proxy or specific field if exists
    if (criterion === 'growth') order = [['followers_count', 'DESC']]; 

    const creators = await Creator.findAll({
      order,
      limit: parseInt(limit),
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }
      ]
    });

    return res.json({
      success: true,
      data: creators
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch top creators' } });
  }
}

module.exports = {
  listCreators,
  getCreatorDetails,
  getCreatorRevenue,
  getCreatorDailyActivity,
  getTopCreators,
  
  /**
   * Verify Creator (Update User verification status)
   * POST /api/v1/admin/creators/:id/verify
   */
  verifyCreator: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // true or false

      const creator = await Creator.findByPk(id);
      if (!creator) return res.status(404).json({ success: false, error: { message: 'Creator not found' } });

      const user = await User.findByPk(creator.user_id);
      if (!user) return res.status(404).json({ success: false, error: { message: 'Linked User not found' } });

      await user.update({ is_verified: status });

      // Notify Admins
      try {
        const adminNotificationService = require('../../services/adminNotificationService');
        await adminNotificationService.notify({
          title: `Creator Verification ${status === 'verified' ? 'Approved' : 'Revoked'}`,
          message: `${req.user.username} changed verification status of ${creator.username || 'Creator'} to ${status}.`,
          type: status === 'verified' ? 'success' : 'warning',
          link: `/admin/creators/${creator.id}`
        });
      } catch (e) { console.error(e); }

      return res.json({
        success: true,
        message: `Creator ${creator.username} verification status updated to ${status}`,
        data: { id: creator.id, is_verified: status }
      });
    } catch (error) {
       console.error(error);
       return res.status(500).json({ success: false, error: { message: 'Failed to update verification' } });
    }
  },

  /**
   * Get Platform-wide Creator Analytics (Stats Cards + Charts)
   * GET /api/v1/admin/creators/analytics
   */
  getCreatorAnalytics: async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      let dateFrom = new Date();
      if (period === '24h') dateFrom.setHours(dateFrom.getHours() - 24);
      if (period === '7d') dateFrom.setDate(dateFrom.getDate() - 7);
      if (period === '30d') dateFrom.setDate(dateFrom.getDate() - 30);

      // 1. Stats Cards
      const totalCreators = await Creator.count();
      const activeCreators = await Creator.count({
        where: { last_active_at: { [Op.gte]: dateFrom } }
      });
      const avgEngagement = await Creator.aggregate('engagement_rate', 'AVG') || 0;
      const totalRevenue = await CreatorRevenue.sum('amount', {
        where: { created_at: { [Op.gte]: dateFrom } }
      }) || 0;

      // 2. Chart Data (Grouped by Date)
      // Note: SQLite/Postgres syntax differs for date grouping. Assuming Postgres.
      // We will fetch raw data and group in JS for simplicity/compatibility unless volume is huge.
      const revenueData = await CreatorRevenue.findAll({
        where: { created_at: { [Op.gte]: dateFrom } },
        attributes: ['amount', 'created_at']
      });

      // Group by day (or hour for 24h)
      const chartMap = {};
      revenueData.forEach(r => {
          const date = new Date(r.created_at);
          let key;
          if (period === '24h') key = `${date.getHours()}:00`;
          else key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!chartMap[key]) chartMap[key] = { name: key, revenue: 0, creators: 0 };
          chartMap[key].revenue += parseFloat(r.amount);
      });

      // Also get new creators count per day
      const newCreatorsData = await Creator.findAll({
          where: { created_at: { [Op.gte]: dateFrom } },
          attributes: ['created_at']
      });
      newCreatorsData.forEach(c => {
          const date = new Date(c.created_at);
          let key;
          if (period === '24h') key = `${date.getHours()}:00`;
          else key = date.toISOString().split('T')[0];

          if (!chartMap[key]) chartMap[key] = { name: key, revenue: 0, creators: 0 };
          chartMap[key].creators += 1;
      });

      const chartData = Object.values(chartMap).sort((a, b) => a.name.localeCompare(b.name));

      return res.json({
        success: true,
        data: {
          stats: {
            total_creators: totalCreators,
            total_revenue: totalRevenue,
            active_creators: activeCreators,
            avg_engagement: parseFloat(avgEngagement).toFixed(2)
          },
          chart: chartData
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: { message: 'Failed to fetch analytics' } });
    }
  }
};
