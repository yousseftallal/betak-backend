const { Video, VideoEngagement, User, Creator, CreatorFollower, sequelize } = require('../../database/models');

/**
 * Toggle Like Video
 * POST /api/v1/interact/like/:videoId
 */
async function toggleLike(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { videoId } = req.params;
    const userId = req.user.id; // From authMiddleware

    const video = await Video.findByPk(videoId);
    if (!video) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: { message: 'Video not found' } });
    }

    // Check if already liked
    const existingLike = await VideoEngagement.findOne({
      where: {
        video_id: videoId,
        user_id: userId,
        type: 'like'
      },
      transaction
    });

    let liked = false;

    if (existingLike) {
      // Unlike
      await existingLike.destroy({ transaction });
      await video.decrement('likes_count', { transaction });
      liked = false;
    } else {
      // Like
      await VideoEngagement.create({
        video_id: videoId,
        user_id: userId,
        type: 'like'
      }, { transaction });
      await video.increment('likes_count', { transaction });
      liked = true;
    }

    await transaction.commit();

    return res.json({
      success: true,
      data: {
        liked,
        likes_count: liked ? video.likes_count + 1 : video.likes_count - 1
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Like Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to toggle like' } });
  }
}

/**
 * Get Like Status
 * GET /api/v1/interact/status/:videoId
 */
async function getLikeStatus(req, res) {
  try {
    const { videoId } = req.params;
    
    // If no user (public view), return false/0 ? Or require auth? 
    // Usually frontend checks this if generic feed.
    // If middleware is loose we check req.user
    if (!req.user) {
        return res.json({ success: true, data: { liked: false } });
    }

    const userId = req.user.id;
    const existingLike = await VideoEngagement.findOne({
      where: {
        video_id: videoId,
        user_id: userId,
        type: 'like'
      }
    });

    return res.json({
      success: true,
      data: {
        liked: !!existingLike
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Error checking status' } });
  }
}

/**
 * Toggle Follow User
 * POST /api/v1/interact/follow/:username
 */
async function toggleFollow(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { username } = req.params; // Using username for URL friendliness
    const followerId = req.user.id;

    const targetUser = await User.findOne({ where: { username }, transaction });
    if (!targetUser) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (targetUser.id === followerId) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: { message: 'Cannot follow yourself' } });
    }

    // Lazy load/create Creator profile for target
    let creator = await Creator.findOne({ where: { user_id: targetUser.id }, transaction });
    if (!creator) {
        creator = await Creator.create({
            user_id: targetUser.id,
            username: targetUser.username
        }, { transaction });
    }

    // Check existing follow
    const existingFollow = await CreatorFollower.findOne({
        where: {
            creator_id: creator.id,
            follower_id: followerId
        },
        transaction
    });

    let following = false;

    if (existingFollow) {
        // Unfollow
        await existingFollow.destroy({ transaction });
        await creator.decrement('followers_count', { transaction });
        following = false;
    } else {
        // Follow
        await CreatorFollower.create({
            creator_id: creator.id,
            follower_id: followerId
        }, { transaction });
        await creator.increment('followers_count', { transaction });
        following = true;
    }

    await transaction.commit();

    return res.json({
        success: true,
        data: {
            following,
            followers_count: following ? creator.followers_count + 1 : creator.followers_count - 1
        }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Follow Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to toggle follow' } });
  }
}

/**
 * Check Follow Status
 * GET /api/v1/interact/follow-status/:username
 */
async function getFollowStatus(req, res) {
    try {
        const { username } = req.params;
        const followerId = req.user.id;

        const targetUser = await User.findOne({ where: { username } });
        if (!targetUser) return res.status(404).json({ success: false, error: { message: 'User not found' } });

        const creator = await Creator.findOne({ where: { user_id: targetUser.id } });
        // If no creator profile, definitely not following
        if (!creator) return res.json({ success: true, data: { following: false } });

        const existingFollow = await CreatorFollower.findOne({
            where: {
                creator_id: creator.id,
                follower_id: followerId
            }
        });

        return res.json({
            success: true,
            data: {
                following: !!existingFollow
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: { message: 'Error' } });
    }
}


module.exports = {
  toggleLike,
  getLikeStatus,
  toggleFollow,
  getFollowStatus
};
