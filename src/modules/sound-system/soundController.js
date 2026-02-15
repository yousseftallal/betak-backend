const { Sound, User } = require('../../database/models');
const { Op } = require('sequelize');

const soundController = {
    // Upload Sound
    uploadSound: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const { title, artist, duration, category_id } = req.body;
            
            // Construct public URL
            // Assuming express static serves 'public' folder at root or /public
            // Adjust based on your server.js static config. Usually /uploads/sounds/...
            const file_url = `/uploads/sounds/${req.file.filename}`;

            const newSound = await Sound.create({
                title: title || req.file.originalname,
                artist: artist || 'Unknown',
                duration: duration ? parseInt(duration) : 0,
                file_url: file_url,
                category_id: category_id || null, // Optional if categorized
                is_trending: false,
                is_flagged: false,
                uses_count: 0
            });

            res.json({ success: true, message: 'Sound uploaded successfully', data: newSound });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // List Sounds
    listSounds: async (req, res) => {
        try {
            const { page = 1, limit = 10, search, filter } = req.query;
            const offset = (page - 1) * limit;
            
            const whereClause = {};

            if (filter === 'trending') {
                whereClause.is_trending = true;
            } else if (filter === 'flagged') {
                whereClause.is_flagged = true;
            }

            if (search) {
                whereClause[Op.or] = [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { artist: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const sounds = await Sound.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: sounds.rows,
                pagination: {
                    total: sounds.count,
                    page: parseInt(page),
                    pages: Math.ceil(sounds.count / limit)
                }
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get Stats
    getStats: async (req, res) => {
        try {
            const totalTracks = await Sound.count();
            const trendingCount = await Sound.count({ where: { is_trending: true } });
            const flaggedCount = await Sound.count({ where: { is_flagged: true } });
            const totalUses = await Sound.sum('uses_count') || 0;

            res.json({
                success: true,
                data: {
                    totalTracks,
                    trendingCount,
                    flaggedCount,
                    totalUses
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Toggle Status (Flag/Trend) - For management
    toggleStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { is_flagged, is_trending } = req.body;
            
            const sound = await Sound.findByPk(id);
            if (!sound) return res.status(404).json({ success: false, message: 'Sound not found' });

            if (is_flagged !== undefined) sound.is_flagged = is_flagged;
            if (is_trending !== undefined) sound.is_trending = is_trending;

            await sound.save();

            res.json({ success: true, message: 'Sound updated', data: sound });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = soundController;
