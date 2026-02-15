const express = require('express');
const router = express.Router();
const feedController = require('./feedController');

// Public Feed
router.get('/', feedController.getFeed);
router.get('/trending', feedController.getTrending);
router.get('/search', feedController.searchVideos);

module.exports = router;

