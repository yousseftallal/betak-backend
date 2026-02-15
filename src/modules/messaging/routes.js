const express = require('express');
const router = express.Router();
const messagingController = require('./messagingController');
const { authenticateUser } = require('../../middlewares/authMiddleware');

// All messaging routes require authentication
router.use(authenticateUser);

// Conversations
router.get('/conversations', messagingController.getConversations);
router.post('/conversations', messagingController.createConversation);

// Messages within a conversation
router.get('/conversations/:id/messages', messagingController.getMessages);
router.post('/conversations/:id/messages', messagingController.sendMessage);

// Mark as read
router.put('/messages/:id/read', messagingController.markAsRead);

module.exports = router;
