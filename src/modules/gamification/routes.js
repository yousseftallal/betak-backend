const express = require('express');
const router = express.Router();
const badgeController = require('./badgeController');
// potentially add authMiddleware if needed, assuming global auth or added here

// router.use(authMiddleware); // If needed

router.get('/', badgeController.getAllBadges);
router.post('/', badgeController.createBadge);
router.post('/award', badgeController.awardBadge);
router.post('/revoke', badgeController.revokeBadge);

module.exports = router;
