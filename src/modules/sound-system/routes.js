const express = require('express');
const router = express.Router();
const soundController = require('./soundController');
const { authenticate } = require('../../middlewares/authMiddleware');

const upload = require('../../middleware/upload');

router.use(authenticate);

router.get('/', soundController.listSounds);
router.post('/', upload.single('file'), soundController.uploadSound);
router.get('/stats', soundController.getStats);
router.put('/:id', soundController.toggleStatus);

module.exports = router;
