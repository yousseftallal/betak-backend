const { Badge, UserBadge, User, sequelize } = require('../../database/models');

const badgeController = {
    // Get all badges
    getAllBadges: async (req, res) => {
        try {
            const badges = await Badge.findAll({
                order: [['created_at', 'DESC']]
            });
            return res.json({ success: true, data: badges });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Create a new badge
    createBadge: async (req, res) => {
        try {
            const { name, description, icon_url, criteria } = req.body;
            const badge = await Badge.create({ name, description, icon_url, criteria });
            return res.status(201).json({ success: true, data: badge });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Award badge to user
    awardBadge: async (req, res) => {
        try {
            const { user_id, badge_id, reason } = req.body;
            
            // Check if already has
            const exists = await UserBadge.findOne({ where: { user_id, badge_id } });
            if (exists) {
                return res.status(400).json({ success: false, error: { message: 'User already has this badge' } });
            }

            await UserBadge.create({ user_id, badge_id, reason });
            return res.json({ success: true, message: 'Badge awarded successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Revoke badge
    revokeBadge: async (req, res) => {
        try {
            const { user_id, badge_id } = req.body;
            await UserBadge.destroy({ where: { user_id, badge_id } });
            return res.json({ success: true, message: 'Badge revoked' });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
};

module.exports = badgeController;
