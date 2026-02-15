const express = require('express');
const router = express.Router();
const verificationController = require('./verificationController');
const { authenticate } = require('../../middlewares/authMiddleware');

router.use(authenticate);

// Routes
router.post('/', verificationController.createVerification);
router.get('/', verificationController.listRequests);
router.get('/stats', verificationController.getStats);
router.put('/:id', verificationController.updateStatus);

module.exports = router;
