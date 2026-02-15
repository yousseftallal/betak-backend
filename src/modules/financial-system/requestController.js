const { ChargeRequest, Voucher, User, Wallet, AdminNotification } = require('../../database/models');
const crypto = require('crypto');

/**
 * Create Charge Request (Public)
 * POST /api/v1/finance/requests
 */
async function createRequest(req, res) {
  try {
    const { amount, payment_method, transaction_reference } = req.body;

    const request = await ChargeRequest.create({
      user_id: req.user.id,
      amount,
      payment_method,
      transaction_reference,
      status: 'pending',
      created_at: new Date()
    });

    // Notify Admins
    await AdminNotification.create({
      admin_id: null,
      title: 'New Charge Request',
      message: `User ${req.user.username} requested ${amount} points.`,
      type: 'financial_request'
    });

    return res.status(201).json({ success: true, message: 'Request submitted', data: request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * List Charge Requests
 * GET /api/v1/finance/requests
 */
async function listRequests(req, res) {
  try {
    const requests = await ChargeRequest.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'avatar_url'] }
      ]
    });

    return res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('List Request Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to list requests' } });
  }
}

/**
 * Approve Request & Generate Voucher Logic
 * POST /api/v1/finance/requests/:id/approve
 */
async function approveRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await ChargeRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, error: { message: 'Request not found' } });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: { message: 'Request already processed' } });
    }

    // 1. Generate unique voucher for this user
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const code = `APPROVED-${request.amount}-${randomHex}`;

    await Voucher.create({
        code,
        amount: request.amount,
        status: 'active',
        created_by: req.user.id,
        // Optional: restrict to specific user if Voucher model supported it, but 'active' implies anyone with code can use.
        // But here we will send it to the user.
    });

    // 2. Update Request
    await request.update({
        status: 'approved',
        generated_voucher_code: code,
        reviewed_by: req.user.id
    });

    // 3. Notify User (Mock Notification)
    console.log(`[NOTIFICATION] Charge Approved for User ${request.user_id}. Code: ${code}`);

    // 4. Notify Admins
    try {
      const adminNotificationService = require('../../services/adminNotificationService');
      await adminNotificationService.notifyFinancialAction({
        action: 'Charge Request Approved',
        performedBy: req.user.username,
        details: `Approved request #${request.id}. Generated voucher for ${request.amount} points.`
      });
    } catch (err) { console.warn('Notification failed', err); }

    return res.json({
      success: true,
      data: {
        request_id: request.id,
        voucher_code: code,
        status: 'approved'
      }
    });

  } catch (error) {
    console.error('Approve Request Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to approve request' } });
  }
}

/**
 * Reject Request
 */
async function rejectRequest(req, res) {
    try {
        const { id } = req.params;
        const request = await ChargeRequest.findByPk(id);

        if (!request) return res.status(404).json({ success: false, error: { message: 'Not Found' } });
        
        await request.update({
            status: 'rejected',
            reviewed_by: req.user.id
        });

        // Notify Admins
        try {
          const adminNotificationService = require('../../services/adminNotificationService');
          await adminNotificationService.notifyFinancialAction({
            action: 'Charge Request Rejected',
            performedBy: req.user.username,
            details: `Rejected request #${id}.`
          });
        } catch (err) { console.warn('Notification failed', err); }

        return res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed' });
    }
}

module.exports = {
  listRequests,
  approveRequest,
  rejectRequest,
  createRequest
};
