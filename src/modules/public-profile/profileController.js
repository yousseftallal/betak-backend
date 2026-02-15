const { User, Video } = require('../../database/models');

/**
 * Get User Profile
 * GET /api/v1/profile/:username
 */
async function getProfile(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'email', 'avatar_url', 'bio', 'created_at'],
      include: [
        {
          model: Video,
          as: 'videos', // Ensure this alias matches your association
          where: { status: 'active' },
          required: false, // Return user even if no videos
          attributes: ['id', 'title', 'thumbnail_url', 'video_url', 'views_count', 'likes_count', 'created_at'],
          limit: 20, // Limit for now
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Calculate aggregate stats
    const stats = {
      followers: 0,
      following: 0,
      likes: user.videos.reduce((sum, vid) => sum + (vid.likes_count || 0), 0)
    };

    // Flatten response to match Android ProfileData model
    const profileData = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name, // Matches @SerializedName("display_name")
      avatar_url: user.avatar_url,     // Matches @SerializedName("avatar_url")
      bio: user.bio,
      is_verified: false,              // Default
      followers_count: stats.followers,
      following_count: stats.following,
      likes_count: stats.likes,
      videos_count: user.videos.length
    };

    return res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch profile' } });
  }
}

/**
 * Update User Profile
 * PUT /api/v1/profile/update
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { display_name, bio, avatar_url, phone, gender, birthday } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Update only provided fields
    const updates = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (phone !== undefined) updates.phone = phone;
    if (gender !== undefined) updates.gender = gender;
    if (birthday !== undefined) updates.birthday = birthday;

    await user.update(updates);

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        phone: user.phone,
        gender: user.gender,
        birthday: user.birthday
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update profile' } });
  }
}

/**
 * Search Users
 * GET /api/v1/profile/search?q=keyword
 */
async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: { message: 'Search query must be at least 2 characters' } });
    }

    const { Op } = require('sequelize');
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { display_name: { [Op.iLike]: `%${q}%` } }
        ],
        status: 'active'
      },
      attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio'],
      limit,
      order: [['username', 'ASC']]
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Search Users Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to search users' } });
  }
}

module.exports = { getProfile, updateProfile, searchUsers };
