const express = require('express');
const router = express.Router();
const videoController = require('./videoController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

router.use(authenticateUser);

// Public User Upload
router.post('/upload',
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  videoController.uploadVideo
);

module.exports = router;
