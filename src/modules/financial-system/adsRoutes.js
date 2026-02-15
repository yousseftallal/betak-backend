const express = require('express');
const router = express.Router();
const adController = require('./adController');

router.get('/', adController.getAllAds);
router.post('/', adController.createAd);
router.put('/:id', adController.updateAd);
router.delete('/:id', adController.deleteAd);

// Public/Active endpoint could be separate or here. 
// For admin purposes, getAllAds is main. active is for app.
router.get('/active', adController.getActiveAds);

module.exports = router;
