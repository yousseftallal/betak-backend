const express = require('express');
const router = express.Router();
const walletController = require('./walletController');
const voucherController = require('./voucherController');
const requestController = require('./requestController');
const { authenticate, authorizeRole } = require('../../middlewares/authMiddleware');

// Middleware to ensure admin
const requireAdmin = [authenticate, authorizeRole(['Super Admin', 'Admin', 'Financial Manager'])];

// Wallet
router.post('/wallet/credit', requireAdmin, walletController.adminCreditUser);
router.get('/wallet/:userId?', requireAdmin, walletController.getBalance);
router.get('/transactions', authenticate, authorizeRole(['Super Admin', 'Financial Manager']), walletController.getTransactions);

// Vouchers
router.post('/vouchers/generate', requireAdmin, voucherController.generateVouchers);
router.get('/vouchers', requireAdmin, voucherController.listVouchers);

// Requests
router.post('/requests', authenticate, requestController.createRequest);
router.get('/requests', requireAdmin, requestController.listRequests);
router.post('/requests/:id/approve', requireAdmin, requestController.approveRequest);
router.post('/requests/:id/reject', requireAdmin, requestController.rejectRequest);

module.exports = router;
