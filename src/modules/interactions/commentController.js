const { Comment, User } = require('../../database/models');

/**
 * List Comments for a Video
 * GET /api/v1/interact/comments/:videoId
 */
async function listComments(req, res) {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAndCountAll({
      where: { video_id: videoId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error('List Comments Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch comments' } });
  }
}

/**
 * Add Comment
 * POST /api/v1/interact/comments/:videoId
 */
async function addComment(req, res) {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Comment content is required' } });
    }

    const comment = await Comment.create({
      video_id: videoId,
      user_id: userId,
      content: content.trim()
    });

    // Fetch full object to return (with user details)
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ]
    });

    // Increment video comments count?
    // Note: Ideally use hooks or background job, but explicit increment here is fine for MVP
    const { Video } = require('../../database/models');
    await Video.increment('comments_count', { where: { id: videoId } });

    return res.json({
      success: true,
      data: fullComment
    });

  } catch (error) {
    console.error('Add Comment Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to post comment' } });
  }
}

module.exports = {
  listComments,
  addComment
};
