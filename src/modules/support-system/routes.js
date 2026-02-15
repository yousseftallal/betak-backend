const express = require('express');
const router = express.Router();
const supportController = require('./supportController');
const { authenticate, authorizeRole } = require('../../middlewares/authMiddleware');

router.use(authenticate);

// Allow specific roles or all authenticated users? Support Agent should see all tickets.
// For now, let's restrict list/update to Admin/Moderator/Support Agent
const requireSupport = authorizeRole(['Super Admin', 'Admin', 'Moderator', 'Support Agent']);

router.get('/', requireSupport, supportController.listTickets);
router.post('/', supportController.createTicket); // Public to auth users
router.get('/stats', requireSupport, supportController.getStats);
router.put('/:id', requireSupport, supportController.updateTicket);
router.post('/tickets/:id/resolve-appeal', authorizeRole(['Super Admin', 'Admin']), supportController.resolveAppeal); // Maybe only Admins can unban


module.exports = router;
