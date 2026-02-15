const { AdBanner } = require('../../database/models');
const { Op } = require('sequelize');

const adController = {
    // Get all admin ads (for dashboard)
    getAllAds: async (req, res) => {
        try {
            const ads = await AdBanner.findAll({
                order: [['created_at', 'DESC']]
            });
            return res.json({ success: true, data: ads });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Get active ads (for public/app)
    getActiveAds: async (req, res) => {
        try {
            const now = new Date();
            const ads = await AdBanner.findAll({
                where: {
                    active: true,
                    [Op.or]: [
                        { valid_until: null },
                        { valid_until: { [Op.gt]: now } }
                    ]
                },
                order: [['created_at', 'DESC']]
            });
            return res.json({ success: true, data: ads });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Create ad
    createAd: async (req, res) => {
        try {
            const { title, description, image_url, link_url, active, valid_until } = req.body;
            const ad = await AdBanner.create({ 
                title, 
                description, 
                image_url, 
                link_url, 
                active: active !== undefined ? active : true,
                valid_until 
            });
            return res.status(201).json({ success: true, data: ad });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Update ad
    updateAd: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await AdBanner.update(req.body, { where: { id } });
            if (updated[0] === 0) return res.status(404).json({ success: false, error: 'Ad not found' });
            return res.json({ success: true, message: 'Ad updated' });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    },

    // Delete ad
    deleteAd: async (req, res) => {
        try {
            const { id } = req.params;
            await AdBanner.destroy({ where: { id } });
            return res.json({ success: true, message: 'Ad deleted' });
        } catch (error) {
            return res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
};

module.exports = adController;
