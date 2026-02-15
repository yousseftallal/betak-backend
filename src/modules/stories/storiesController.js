const { Story, StoryView, User } = require('../../database/models');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

// GET /feed - Get stories from users the current user follows (or all for now)
exports.getStoryFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // Get active (non-expired) stories, grouped by user
        const stories = await Story.findAll({
            where: {
                expires_at: { [Op.gt]: now },
                is_active: true
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'display_name', 'profile_image_url']
                },
                {
                    model: StoryView,
                    as: 'views',
                    where: { viewer_id: userId },
                    required: false, // LEFT JOIN
                    attributes: ['id', 'viewed_at']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 100
        });

        // Group stories by user
        const userStoriesMap = {};
        stories.forEach(story => {
            const s = story.toJSON();
            const uid = s.user.id;

            if (!userStoriesMap[uid]) {
                userStoriesMap[uid] = {
                    user: s.user,
                    stories: [],
                    hasUnviewed: false
                };
            }

            const isViewed = s.views && s.views.length > 0;
            if (!isViewed) userStoriesMap[uid].hasUnviewed = true;

            userStoriesMap[uid].stories.push({
                id: s.id,
                mediaUrl: s.media_url,
                mediaType: s.media_type,
                textOverlay: s.text_overlay,
                backgroundColor: s.background_color,
                viewsCount: s.views_count,
                isViewed,
                createdAt: s.created_at,
                expiresAt: s.expires_at
            });
        });

        // Convert to array and sort (unviewed first, then by recency)
        const storyGroups = Object.values(userStoriesMap);
        storyGroups.sort((a, b) => {
            if (a.hasUnviewed && !b.hasUnviewed) return -1;
            if (!a.hasUnviewed && b.hasUnviewed) return 1;
            return 0; // Keep original order
        });

        // Put current user's stories first
        const myIndex = storyGroups.findIndex(g => g.user.id === userId);
        if (myIndex > 0) {
            const [myStories] = storyGroups.splice(myIndex, 1);
            storyGroups.unshift(myStories);
        }

        res.json({ success: true, data: storyGroups });
    } catch (err) {
        console.error('getStoryFeed error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// POST / - Create a new story
exports.createStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mediaUrl, mediaType = 'image', textOverlay, backgroundColor } = req.body;

        if (!mediaUrl) {
            return res.status(400).json({ success: false, error: { message: 'mediaUrl is required' } });
        }

        // Story expires after 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const story = await Story.create({
            user_id: userId,
            media_url: mediaUrl,
            media_type: mediaType,
            text_overlay: textOverlay || null,
            background_color: backgroundColor || null,
            expires_at: expiresAt
        });

        const fullStory = await Story.findByPk(story.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'display_name', 'profile_image_url'] }
            ]
        });

        res.status(201).json({ success: true, data: fullStory });
    } catch (err) {
        console.error('createStory error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// DELETE /:id - Delete own story
exports.deleteStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const story = await Story.findByPk(id);
        if (!story) {
            return res.status(404).json({ success: false, error: { message: 'Story not found' } });
        }
        if (story.user_id !== userId) {
            return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
        }

        await story.update({ is_active: false });
        res.json({ success: true, message: 'Story deleted' });
    } catch (err) {
        console.error('deleteStory error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// POST /:id/view - Mark story as viewed
exports.viewStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const story = await Story.findByPk(id);
        if (!story) {
            return res.status(404).json({ success: false, error: { message: 'Story not found' } });
        }

        // Create view record (or ignore if already exists)
        const [view, created] = await StoryView.findOrCreate({
            where: { story_id: parseInt(id), viewer_id: userId },
            defaults: { viewed_at: new Date() }
        });

        // Increment views count if new view
        if (created) {
            await story.increment('views_count');
        }

        res.json({ success: true, data: { viewed: true } });
    } catch (err) {
        console.error('viewStory error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// GET /my - Get current user's stories
exports.getMyStories = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        const stories = await Story.findAll({
            where: {
                user_id: userId,
                expires_at: { [Op.gt]: now },
                is_active: true
            },
            include: [
                {
                    model: StoryView,
                    as: 'views',
                    include: [
                        { model: User, as: 'viewer', attributes: ['id', 'username', 'display_name', 'profile_image_url'] }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, data: stories });
    } catch (err) {
        console.error('getMyStories error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};
