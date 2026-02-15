const { Op } = require('sequelize');
const { Video, User, Report, AdminNotification } = require('../../database/models');

/**
 * List Videos (with filtering & sort)
 * GET /api/v1/admin/videos
 */
/**
 * List Videos (with filtering & sort)
 * GET /api/v1/admin/videos
 */
async function listVideos(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      category, 
      is_featured, 
      date_from, 
      date_to,
      sort = 'newest' 
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};
    
    // 1. Search
    if (search) {
      const titleSearch = { [Op.iLike]: `%${search}%` };
      if (!isNaN(search)) {
          where[Op.or] = [
              { title: titleSearch },
              { id: parseInt(search) },
              // Enable searching by user ID if passing numeric
               { user_id: parseInt(search) }
          ];
      } else {
          where.title = titleSearch;
      }
    }

    // 2. Filters
    if (status && status !== 'all') where.status = status;
    if (category && category !== 'all') where.category = category;
    if (is_featured === 'true') where.is_featured = true;

    // 3. Date Range
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = endDate;
      }
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'oldest') order = [['created_at', 'ASC']];
    if (sort === 'most_viewed') order = [['views_count', 'DESC']];
    if (sort === 'most_reported') order = [['reports_count', 'DESC']];
    if (sort === 'longest') order = [['duration', 'DESC']];
    if (sort === 'shortest') order = [['duration', 'ASC']];

    const { count, rows } = await Video.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      attributes: { exclude: ['watch_time_total'] },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ]
    });

    return res.json({
      success: true,
      data: {
        rows: rows,
        count: count, // Standardize to 'count' like users
        pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('List Videos Error:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
}

/**
 * Toggle Feature Status
 * POST /api/v1/admin/videos/:id/feature
 */
async function toggleFeature(req, res) {
    try {
        const { id } = req.params;
        const video = await Video.findByPk(id);
        
        if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

        // Toggle
        const newValue = !video.is_featured;
        await video.update({ is_featured: newValue });

        return res.json({
            success: true,
            message: newValue ? 'Video added to featured' : 'Video removed from featured',
            data: { id: video.id, is_featured: newValue }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to toggle feature status' });
    }
}

/**
 * Get Video Details
 * GET /api/v1/admin/videos/:id
 */
async function getVideo(req, res) {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url', 'status']
        },
        {
          model: Report,
          as: 'reports',
          attributes: ['id', 'category', 'status', 'created_at'],
          limit: 10
        }
      ]
    });

    if (!video) {
      return res.status(404).json({ success: false, error: { message: 'Video not found' } });
    }

    return res.json({
      success: true,
      data: { video }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch video details' } });
  }
}

/**
 * Hide Video (Soft Delete/Hide)
 * POST /api/v1/admin/videos/:id/hide
 */
async function hideVideo(req, res) {
  try {
    const { id } = req.params;
    
    // Note: In real app, you might want to ask for a reason
    const video = await Video.findByPk(id);
    if (!video) return res.status(404).json({ success: false, error: { message: 'Video not found' } });

    await video.update({ status: 'hidden' });

    return res.json({
      success: true,
      message: 'Video has been hidden',
      data: { videoId: video.id, status: 'hidden' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to hide video' } });
  }
}

/**
 * Delete Video (Permanent or Soft Delete)
 * DELETE /api/v1/admin/videos/:id
 */
async function deleteVideo(req, res) {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);
    if (!video) return res.status(404).json({ success: false, error: { message: 'Video not found' } });

    // Use paranoid delete (soft delete) by default as defined in model
    await video.destroy();

    // Notify Admins
    try {
      const adminNotificationService = require('../../services/adminNotificationService');
      await adminNotificationService.notify({
        title: 'Video Deleted',
        message: `${req.user.username} deleted video "${video.title}" (ID: ${id})`,
        type: 'error',
        link: null
      });
    } catch (e) { console.error(e); }

    return res.json({
      success: true,
      message: 'Video has been deleted',
      data: { videoId: id }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to delete video' } });
  }
}

/**
 * Restore Video
 * POST /api/v1/admin/videos/:id/restore
 */
async function restoreVideo(req, res) {
  try {
    const { id } = req.params;

    // Use paranoid: false to find soft-deleted videos
    const video = await Video.findByPk(id, { paranoid: false });
    if (!video) return res.status(404).json({ success: false, error: { message: 'Video not found' } });

    if (video.deleted_at) {
      await video.restore();
    }
    await video.update({ status: 'published' });

    // Notify Admins
    try {
      const adminNotificationService = require('../../services/adminNotificationService');
      await adminNotificationService.notify({
        title: 'Video Restored',
        message: `${req.user.username} restored video "${video.title}" (ID: ${video.id})`,
        type: 'success',
        link: `/admin/videos/${video.id}`
      });
    } catch (e) { console.error(e); }

    return res.json({
      success: true,
      message: 'Video has been restored',
      data: { videoId: video.id, status: 'published' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Failed to restore video' } });
  }
}

/**
 * Upload Video
 * POST /api/v1/admin/videos/upload
 */
async function uploadVideo(req, res) {
  try {
    // Files are available in req.files['video'] and req.files['thumbnail']
    // Body fields in req.body
    
    const { title, description } = req.body;
    
    if (!req.files || !req.files['video']) {
      return res.status(400).json({ success: false, error: { message: 'Video file is required' } });
    }

    const videoFile = req.files['video'][0];
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    // Create video record
    // Note: In a real app, you'd process the video to get duration, dimensions, etc.
    // For now we use placeholder values or random
    
    // Default user (Admin) or from token if available
    const userId = req.user ? req.user.id : 1; 

    // Detect Type
    const mimeType = videoFile.mimetype;
    let type = 'video';
    if (mimeType.startsWith('image/')) type = 'image';

    const newVideo = await Video.create({
      user_id: userId,
      title: title || (type === 'image' ? 'Start' : 'Untitled Video'),
      description: description || '',
      type: type,
      video_url: `${process.env.content_base_url || 'http://localhost:3000'}/uploads/videos/${videoFile.filename}`, // Keeping path as videos/ for simplicity or fix in middleware
      thumbnail_url: thumbnailFile 
        ? `${process.env.content_base_url || 'http://localhost:3000'}/uploads/thumbnails/${thumbnailFile.filename}` 
        : (type === 'image' ? `${process.env.content_base_url || 'http://localhost:3000'}/uploads/videos/${videoFile.filename}` : null), // Use image itself as thumb if image
      status: 'active',
      duration: 0, 
      created_at: new Date()
    });

    // Notify Admins
    await AdminNotification.create({
      admin_id: null,
      title: 'New Video Uploaded',
      message: `User ${userId} uploaded a new video: "${newVideo.title}".`,
      type: 'video_upload'
    });

    return res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: newVideo
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to upload video' } });
  }
}

module.exports = {
  listVideos,
  getVideo,
  hideVideo,
  deleteVideo,
  restoreVideo,
  uploadVideo,
  toggleFeature
};
