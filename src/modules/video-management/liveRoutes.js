const express = require('express');
const router = express.Router();
const liveStreamController = require('./liveStreamController');
const { authenticateToken, authorizeRole } = require('../../middlewares/authMiddleware');

// Middleware
// router.use(authenticateToken); 
// router.use(authorizeRole(['Super Admin', 'Admin', 'Moderator']));

// Routes
router.get('/', liveStreamController.listStreams);
router.post('/:id/end', liveStreamController.endStream);
router.post('/:id/ban', liveStreamController.banUserFromLive);

module.exports = router;
