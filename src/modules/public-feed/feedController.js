const { Video, User } = require('../../database/models');
const { Op } = require('sequelize');

/**
 * Get Public Video Feed
 * GET /api/v1/feed
 */
async function getFeed(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const videos = await Video.findAll({
      where: { status: 'active' }, // Only active videos
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']], // Newest first
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'avatar_url', 'is_verified']
        }
      ],
      attributes: [
        'id', 'title', 'description', 'video_url', 'thumbnail_url',
        'likes_count', 'comments_count', 'shares_count', 'views_count', 'created_at'
      ]
    });

    return res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Feed Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch feed' } });
  }
}

/**
 * Get Trending Videos (sorted by views/likes)
 * GET /api/v1/feed/trending
 */
async function getTrending(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const videos = await Video.findAll({
      where: { status: 'active' },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['views_count', 'DESC'], ['likes_count', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'avatar_url', 'is_verified']
        }
      ],
      attributes: [
        'id', 'title', 'description', 'video_url', 'thumbnail_url',
        'likes_count', 'comments_count', 'shares_count', 'views_count', 'created_at'
      ]
    });

    return res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Trending Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch trending' } });
  }
}

/**
 * Search Videos
 * GET /api/v1/feed/search?q=keyword
 */
async function searchVideos(req, res) {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const offset = (page - 1) * limit;

    const videos = await Video.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['views_count', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'avatar_url', 'is_verified']
        }
      ],
      attributes: [
        'id', 'title', 'description', 'video_url', 'thumbnail_url',
        'likes_count', 'comments_count', 'shares_count', 'views_count', 'created_at'
      ]
    });

    return res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Search Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to search videos' } });
  }
}

module.exports = {
  getFeed,
  getTrending,
  searchVideos
};

