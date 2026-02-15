const express = require('express');
const router = express.Router();
const profileController = require('./profileController');
const { authenticateUser } = require('../../middlewares/authMiddleware');

// Public routes
router.get('/search', profileController.searchUsers);
router.get('/:username', profileController.getProfile);

// Protected routes
router.put('/update', authenticateUser, profileController.updateProfile);

module.exports = router;
