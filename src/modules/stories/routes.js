const express = require('express');
const router = express.Router();
const storiesController = require('./storiesController');
const { authenticateUser } = require('../../middlewares/authMiddleware');

// All story routes require authentication
router.use(authenticateUser);

router.get('/feed', storiesController.getStoryFeed);
router.get('/my', storiesController.getMyStories);
router.post('/', storiesController.createStory);
router.delete('/:id', storiesController.deleteStory);
router.post('/:id/view', storiesController.viewStory);

module.exports = router;
