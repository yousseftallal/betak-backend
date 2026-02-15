const Joi = require('joi');
const { User, Role, AdminNotification } = require('../../database/models');
const { generateTokens } = require('../../config/jwt');

/**
 * Google Sign-In: receives Firebase ID token + user info
 * Creates or finds user, returns JWT tokens
 */
const googleAuth = async (req, res) => {
    // LOGGING ADDED FOR DEBUGGING
    console.log('🔵 Received Google Auth Request:', JSON.stringify(req.body, null, 2));

    try {
        const schema = Joi.object({
            id_token: Joi.string().required(),
            email: Joi.string().email().required(),
            display_name: Joi.string().allow('').optional(),
            photo_url: Joi.string().allow('', null).optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            console.log('❌ Validation Error:', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, display_name, photo_url } = value;
        console.log(`🔍 Searching for user with email: ${email}`);

        // Find or create user by email
        let user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('✨ User not found, creating new user...');
            // Auto-create user from Google data
            const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

            // Check if username is taken, append random if so
            let finalUsername = username;
            const existingUser = await User.findOne({ where: { username: finalUsername } });
            if (existingUser) {
                finalUsername = `${username}_${Math.floor(Math.random() * 9999)}`;
            }

            // Get default role (Optional now)
            const defaultRole = await Role.findOne({ where: { name: 'User' } });

            if (!defaultRole) {
                console.warn('⚠️ Default Role "User" not found. Creating user without role (Decoupled Mode).');
            }

            user = await User.create({
                username: finalUsername,
                email: email,
                password: `google_${Date.now()}_${Math.random().toString(36).slice(2)}`, // Random unusable password
                avatar_url: photo_url || null,
                status: 'active',
                role_id: defaultRole ? defaultRole.id : null
                // Removed auth_provider as per schema limitation
            });
            console.log(`✅ User created: ${user.username} (ID: ${user.id})`);

            // Notify admin about new user
            try {
                if (AdminNotification) {
                    await AdminNotification.create({
                        type: 'new_user',
                        title: 'مستخدم جديد (Google)',
                        message: `${user.username} انضم عبر Google`,
                        data: JSON.stringify({ userId: user.id, method: 'google' }),
                        priority: 'low'
                    });
                }
            } catch (notifErr) {
                console.log('AdminNotification skip:', notifErr.message);
            }
        } else {
            console.log(`✅ Found existing user: ${user.username} (ID: ${user.id})`);
        }

        // Check if user is active
        if (user.status !== 'active') {
            console.log('⛔ User status is not active:', user.status);
            return res.status(403).json({
                success: false,
                message: 'هذا الحساب معلق أو محظور'
            });
        }

        // Generate JWT tokens
        console.log('🔑 Generating tokens...');
        const tokens = generateTokens(user);

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح عبر Google',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name, // Might be null if not in DB
                    avatar_url: user.avatar_url,
                    status: user.status
                },
                tokens
            }
        });
        console.log('🚀 Response sent successfully');
    } catch (err) {
        console.error('❌ Google auth error:', err);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول بـ Google'
        });
    }
};

module.exports = { googleAuth };
