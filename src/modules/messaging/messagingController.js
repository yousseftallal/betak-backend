const { Conversation, Message, User } = require('../../database/models');
const { Op } = require('sequelize');

// GET /conversations - List user's conversations
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { participant1_id: userId },
                    { participant2_id: userId }
                ],
                is_active: true
            },
            include: [
                {
                    model: User,
                    as: 'participant1',
                    attributes: ['id', 'username', 'display_name', 'profile_image_url']
                },
                {
                    model: User,
                    as: 'participant2',
                    attributes: ['id', 'username', 'display_name', 'profile_image_url']
                }
            ],
            order: [['last_message_at', 'DESC']],
            limit: 50
        });

        // Map to include the "other user" info
        const mapped = conversations.map(conv => {
            const c = conv.toJSON();
            const otherUser = c.participant1_id === userId ? c.participant2 : c.participant1;

            // Count unread messages
            return {
                id: c.id,
                otherUser,
                lastMessage: c.last_message,
                lastMessageAt: c.last_message_at,
                createdAt: c.created_at
            };
        });

        res.json({ success: true, data: mapped });
    } catch (err) {
        console.error('getConversations error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// POST /conversations - Start or get existing conversation
exports.createConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ success: false, error: { message: 'participantId is required' } });
        }

        if (parseInt(participantId) === userId) {
            return res.status(400).json({ success: false, error: { message: 'Cannot create conversation with yourself' } });
        }

        // Check if target user exists
        const targetUser = await User.findByPk(participantId);
        if (!targetUser) {
            return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }

        // Check if conversation already exists (in either direction)
        const p1 = Math.min(userId, parseInt(participantId));
        const p2 = Math.max(userId, parseInt(participantId));

        let conversation = await Conversation.findOne({
            where: {
                participant1_id: p1,
                participant2_id: p2
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participant1_id: p1,
                participant2_id: p2
            });
        }

        // Include participant info
        const fullConv = await Conversation.findByPk(conversation.id, {
            include: [
                { model: User, as: 'participant1', attributes: ['id', 'username', 'display_name', 'profile_image_url'] },
                { model: User, as: 'participant2', attributes: ['id', 'username', 'display_name', 'profile_image_url'] }
            ]
        });

        const c = fullConv.toJSON();
        const otherUser = c.participant1_id === userId ? c.participant2 : c.participant1;

        res.json({
            success: true,
            data: {
                id: c.id,
                otherUser,
                lastMessage: c.last_message,
                lastMessageAt: c.last_message_at
            }
        });
    } catch (err) {
        console.error('createConversation error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// GET /conversations/:id/messages - Get messages
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Verify user is participant
        const conversation = await Conversation.findByPk(id);
        if (!conversation) {
            return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });
        }
        if (conversation.participant1_id !== userId && conversation.participant2_id !== userId) {
            return res.status(403).json({ success: false, error: { message: 'Not a participant of this conversation' } });
        }

        const messages = await Message.findAndCountAll({
            where: { conversation_id: id },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'profile_image_url'] }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: messages.rows,
            pagination: {
                total: messages.count,
                page,
                pages: Math.ceil(messages.count / limit)
            }
        });
    } catch (err) {
        console.error('getMessages error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// POST /conversations/:id/messages - Send a message
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { content, type = 'text' } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, error: { message: 'Message content is required' } });
        }

        // Verify user is participant
        const conversation = await Conversation.findByPk(id);
        if (!conversation) {
            return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });
        }
        if (conversation.participant1_id !== userId && conversation.participant2_id !== userId) {
            return res.status(403).json({ success: false, error: { message: 'Not a participant' } });
        }

        // Create message
        const message = await Message.create({
            conversation_id: parseInt(id),
            sender_id: userId,
            content: content.trim(),
            type
        });

        // Update conversation's last message
        await conversation.update({
            last_message: content.trim().substring(0, 200),
            last_message_at: new Date()
        });

        // Fetch with sender info
        const fullMessage = await Message.findByPk(message.id, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'profile_image_url'] }
            ]
        });

        res.status(201).json({ success: true, data: fullMessage });
    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};

// PUT /messages/:id/read - Mark message as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const message = await Message.findByPk(id, {
            include: [{ model: Conversation, as: 'conversation' }]
        });

        if (!message) {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }

        // Only the recipient can mark as read (not the sender)
        const conv = message.conversation;
        if (conv.participant1_id !== userId && conv.participant2_id !== userId) {
            return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
        }

        if (message.sender_id !== userId && !message.read_at) {
            await message.update({ read_at: new Date() });
        }

        res.json({ success: true, data: message });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
};
