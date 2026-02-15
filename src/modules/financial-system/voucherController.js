const { Voucher, User } = require('../../database/models');
const crypto = require('crypto');

/**
 * Generate Voucher Codes
 * POST /api/v1/finance/vouchers/generate
 * Body: { amount, count, expirationDate }
 */
async function generateVouchers(req, res) {
  try {
    const { amount, count = 1, expirationDate } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, error: { message: 'Amount is required' } });
    }

    const vouchers = [];
    for (let i = 0; i < count; i++) {
        // Generate random code format: BTK-XXXX-XXXX
        const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
        const code = `BTK-${amount}-${randomHex}`;
        
        vouchers.push({
            code,
            amount,
            status: 'active',
            created_by: req.user.id,
            expires_at: expirationDate || null
        });
    }

    const created = await Voucher.bulkCreate(vouchers);

    return res.json({
      success: true,
      data: created
    });

  } catch (error) {
    console.error('Generate Voucher Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to generate vouchers' } });
  }
}

/**
 * List Vouchers
 * GET /api/v1/finance/vouchers
 */
async function listVouchers(req, res) {
    try {
        const vouchers = await Voucher.findAll({
            order: [['created_at', 'DESC']],
            include: [
                { model: User, as: 'creator', attributes: ['username'] },
                { model: User, as: 'redeemer', attributes: ['username'] }
            ]
        });

        return res.json({
            success: true,
            data: vouchers
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: 'Failed to list vouchers' } });
    }
}

module.exports = {
    generateVouchers,
    listVouchers
};
