const { Wallet, User } = require('../../database/models');

/**
 * Get Wallet Balance (Admin view for a user OR User view for self)
 * GET /api/v1/finance/wallet/:userId?
 */
async function getBalance(req, res) {
  try {
    const userId = req.params.userId || req.user.id; // User can see own, Admin can see others
    
    // Security check: If not admin and requesting other user, forbid
    if (req.user.role.name !== 'Super Admin' && req.user.role.name !== 'Admin' && parseInt(userId) !== req.user.id) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized access to wallet' } });
    }

    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) {
      return res.status(404).json({ success: false, error: { message: 'Wallet not found' } });
    }

    return res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Get Balance Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch wallet' } });
  }
}

/**
 * Admin Manual Credit/Debit
 * POST /api/v1/finance/wallet/credit
 * Body: { userId, amount, type: 'credit'|'debit', reason }
 */
async function adminCreditUser(req, res) {
  try {
    const { userId, amount, type = 'credit', reason } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ success: false, error: { message: 'User ID and Amount are required' } });
    }

    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) {
      // Create if missing
       await Wallet.create({ user_id: userId, balance: 0 });
       // Refetch
    }
    
    const finalWallet = await Wallet.findOne({ where: { user_id: userId } });
    const currentBalance = parseFloat(finalWallet.balance);
    const value = parseFloat(amount);
    
    let newBalance = currentBalance;
    if (type === 'credit') newBalance += value;
    else newBalance = Math.max(0, newBalance - value);

    await finalWallet.update({ balance: newBalance });

    // Log Transaction
    const { WalletTransaction } = require('../../database/models');
    await WalletTransaction.create({
        wallet_id: finalWallet.id,
        user_id: userId,
        amount: value,
        type: type, // 'credit' or 'debit'
        description: reason || `Admin manual ${type}`,
        status: 'completed',
        reference_id: `ADMIN-${req.user.id}-${Date.now()}`
    });

    // Notify Admins
    try {
      const adminNotificationService = require('../../services/adminNotificationService');
      await adminNotificationService.notifyFinancialAction({
        action: `Manual Wallet ${type === 'credit' ? 'Credit' : 'Debit'}`,
        performedBy: req.user.username,
        details: `${type === 'credit' ? 'Added' : 'Removed'} ${value} points for user ID ${userId}. Reason: ${reason || 'N/A'}`
      });
    } catch(err) {
      console.warn('Failed to send notification', err);
    }

    return res.json({
      success: true,
      message: `Wallet ${type}ed successfully`,
      data: {
        new_balance: newBalance
      }
    });

  } catch (error) {
    console.error('Admin Credit Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update wallet' } });
  }
}

/**
 * Get Wallet Transactions (Mock)
 * GET /api/v1/finance/transactions
 */
async function getTransactions(req, res) {
    try {
        const { WalletTransaction, User } = require('../../database/models');
        
        const transactions = await WalletTransaction.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 50 // Limit for now
        });

        return res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: 'Failed to fetch transactions' } });
    }
}

module.exports = {
  getBalance,
  adminCreditUser,
  getTransactions
};
