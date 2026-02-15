const express = require('express');
const router = express.Router();
const healthController = require('./healthController');
const { authenticate } = require('../../middlewares/authMiddleware');

router.get('/', authenticate, healthController.getSystemHealth);

module.exports = router;
