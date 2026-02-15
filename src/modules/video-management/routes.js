const express = require('express');
const router = express.Router();
const videoController = require('./videoController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

router.use(authenticate);

// Upload Video
router.post('/upload', 
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), 
  videoController.uploadVideo
);

// List Videos
router.get('/', checkPermission('videos:read'), videoController.listVideos);

// Get Video Details
router.get('/:id', checkPermission('videos:read'), videoController.getVideo);

// Hide Video
router.post('/:id/hide', checkPermission('videos:hide'), videoController.hideVideo);

// Delete Video
router.delete('/:id', checkPermission('videos:delete'), videoController.deleteVideo);

// Restore Video
router.post('/:id/restore', checkPermission('videos:restore'), videoController.restoreVideo);

// Feature/Unfeature Video
router.post('/:id/feature', checkPermission('videos:edit'), videoController.toggleFeature);

module.exports = router;
