const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { googleAuth } = require('./googleAuthController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', googleAuth);

module.exports = router;
