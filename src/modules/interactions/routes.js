const express = require('express');
const router = express.Router();
const interactionController = require('./interactionController');
const { authenticateUser } = require('../../middlewares/authMiddleware');

router.use(authenticateUser);

// Likes
router.post('/like/:videoId', interactionController.toggleLike);
router.get('/status/:videoId', interactionController.getLikeStatus);

// Follows
router.post('/follow/:username', interactionController.toggleFollow);
router.get('/follow-status/:username', interactionController.getFollowStatus);

// Comments
const commentController = require('./commentController');
router.get('/comments/:videoId', commentController.listComments);
router.post('/comments/:videoId', commentController.addComment);

module.exports = router;
