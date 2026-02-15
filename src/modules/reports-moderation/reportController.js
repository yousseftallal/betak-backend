const { Op } = require('sequelize');
const { Report, User, Video, Comment, Sound, Admin, sequelize, AdminNotification } = require('../../database/models');

/**
 * Create a new Report
 * POST /api/v1/admin/reports (or public route)
 */
async function createReport(req, res) {
  try {
    const { reported_type, reported_id, category, description, target_id } = req.body;
    // target_id might be redundancy for reported_id depending on schema. Keeping generic.
    // In schema 'reported_id' is the ID of the object. 'reported_type' is 'user', 'video', etc.

    const newReport = await Report.create({
      reporter_id: req.user.id,
      reported_type, // 'user', 'video', 'comment'
      reported_id,
      category, // 'spam', 'abuse', etc.
      description,
      status: 'open',
      priority: 'medium', // Default
      created_at: new Date()
    });

    // Notify Admins
    await AdminNotification.create({
      admin_id: null,
      title: 'New Content Report',
      message: `User ${req.user.username} reported a ${reported_type} for ${category}.`,
      type: 'report'
    });

    return res.status(201).json({ success: true, message: 'Report submitted', data: newReport });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
}

/**
 * List Reports (Filtered & Sorted)
 * GET /api/v1/admin/reports
 */
async function listReports(req, res) {
  try {
    const { page = 1, limit = 10, status, type, priority, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status; // pending, resolved, ignored
    if (type) where.reported_type = type; // user, video, comment
    if (priority) where.priority = priority;
    
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['priority', 'DESC'], // High priority first
        ['created_at', 'ASC'] // Oldest first (FIFO)
      ],
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'username'] },
        { model: Admin, as: 'assignedAdmin', attributes: ['id', 'username'] }
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
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch reports' } });
  }
}

/**
 * Get Report Details (with Target Info)
 * GET /api/v1/admin/reports/:id
 */
async function getReportdetails(req, res) {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'username', 'avatar_url'] },
        { model: Admin, as: 'reviewer', attributes: ['id', 'username'] }
      ]
    });

    if (!report) return res.status(404).json({ success: false, error: { message: 'Report not found' } });

    // Fetch Target Details Dynamically
    let target = null;
    if (report.reported_type === 'user') {
      target = await User.findByPk(report.reported_id, { attributes: ['id', 'username', 'email', 'status'] });
    } else if (report.reported_type === 'video') {
      target = await Video.findByPk(report.reported_id, { attributes: ['id', 'title', 'video_url', 'status'] });
    }
    // Comment fetching to be added if needed

    return res.json({
      success: true,
      data: {
        report,
        target_details: target
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch report details' } });
  }
}

/**
 * Update Report Status (Resolve/Ignore)
 * POST /api/v1/admin/reports/:id/status
 */
async function updateReportStatus(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, resolution_notes, action_taken } = req.body; // action_taken: e.g., 'ban_user', 'delete_video'

    const report = await Report.findByPk(id);
    if (!report) {
         await t.rollback();
         return res.status(404).json({ success: false, error: { message: 'Report not found' } });
    }

    // Update Report
    await report.update({
      status, // resolved, ignored
      moderator_notes: resolution_notes,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    }, { transaction: t });

    // If an automatic action is requested along with resolution
    if (status === 'resolved' && action_taken) {
      
      // BAN USER ACTION
      if (action_taken === 'ban_user') {
          let targetUserId = null;

          if (report.reported_type === 'user') targetUserId = report.target_id;
          else if (report.reported_type === 'video') {
              const video = await Video.findByPk(report.target_id);
              if (video) targetUserId = video.user_id;
          } else if (report.reported_type === 'comment') {
              const comment = await Comment.findByPk(report.target_id);
              if (comment) targetUserId = comment.user_id;
          } else if (report.reported_type === 'sound') {
              const sound = await Sound.findByPk(report.target_id);
              if (sound) targetUserId = sound.uploaded_by;
          }

          if (targetUserId) {
              await User.update({ status: 'banned' }, { where: { id: targetUserId }, transaction: t });
          }
      }
    }

    // Commit the main transaction (Status Update + Ban)
    await t.commit();

    // DELETE CONTENT ACTION (Performed separately to avoid rolling back Ban on failure)
    try {
        if ((action_taken === 'delete_content' || action_taken === 'ban_user') && status === 'resolved') {
            if (report.reported_type === 'video') {
                const video = await Video.findByPk(report.target_id);
                if (video) await video.destroy(); // No transaction or new transaction
            } else if (report.reported_type === 'comment') {
                const comment = await Comment.findByPk(report.target_id);
                if (comment) await comment.destroy();
            } else if (report.reported_type === 'sound') {
                const sound = await Sound.findByPk(report.target_id);
                if (sound) await sound.destroy();
            }
        }
    } catch (deleteError) {
        console.error('Failed to delete reported content after ban:', deleteError);
        // We do not return error as the report is resolved and user banned.
        return res.json({
            success: true,
            message: `Report resolved and user banned, but content deletion failed: ${deleteError.message}`,
            data: { reportId: id, status }
        });
    }

    return res.json({
      success: true,
      message: `Report ${status} successfully`,
      data: { reportId: id, status }
    });

  } catch (error) {
    try { await t.rollback(); } catch (e) {}
    return res.status(500).json({ success: false, error: { message: error.message || 'Failed to update report' } });
  }
}


/**
 * Get Most Reported Users
 * GET /api/v1/admin/reports/stats/users
 */
async function getMostReportedUsers(req, res) {
  try {
    const mostReported = await Report.findAll({
      where: { reported_type: 'user' },
      attributes: [
        'reported_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'report_count']
      ],
      group: ['reported_id', 'User.id'], // Group by User.id if included, but here we group by reported_id
      order: [[sequelize.literal('report_count'), 'DESC']],
      limit: 10,
      include: [
        { model: User, as: 'reportedUser', foreignKey: 'reported_id', attributes: ['id', 'username', 'email', 'status'] } // Adjust alias if needed
      ]
    });
    // Note: 'reportedUser' alias depends on association definition. Assuming standard linking or using manual fetch if alias issue.
    // Ideally: Report.belongsTo(User, { foreignKey: 'reported_id', constraints: false, as: 'reportedUser' })
    // If association is dynamic (polymorphic), direct include might be tricky without defined association.
    // Fallback: Fetch IDs then fetch Users.
    
    // Simpler fallback for polymorphic safety if associations aren't perfect:
    // 1. Get IDs
    // 2. Fetch Users
    
    return res.json({
      success: true,
      data: mostReported
    });
  } catch (error) {
    console.error('Reports Stats Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch most reported users' } });
  }
}

/**
 * Get Most Reported Videos
 * GET /api/v1/admin/reports/stats/videos
 */
async function getMostReportedVideos(req, res) {
  try {
    const mostReported = await Report.findAll({
      where: { reported_type: 'video' },
      attributes: [
        'reported_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'report_count']
      ],
      group: ['reported_id'],
      order: [[sequelize.literal('report_count'), 'DESC']],
      limit: 10
    });
    
    // Fetch video details manually to be safe with polymorphic logic
    const videoIds = mostReported.map(r => r.reported_id);
    const videos = await Video.findAll({ where: { id: { [Op.in]: videoIds } }, attributes: ['id', 'title', 'video_url', 'status'] });
    
    // Merge
    const result = mostReported.map(r => {
      const video = videos.find(v => v.id === r.reported_id);
      return {
        ...r.toJSON(),
        video
      };
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch most reported videos' } });
  }
}

module.exports = {
  listReports,
  getReportdetails,
  updateReportStatus,
  getMostReportedUsers,
  getMostReportedVideos,
  createReport
};
