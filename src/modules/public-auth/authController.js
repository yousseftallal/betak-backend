const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { User, Role, AdminNotification } = require('../../database/models');
const { generateTokens } = require('../../config/jwt');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  country: Joi.string().optional() // Optional for now to avoid breaking existing clients
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

async function register(req, res) {
  try {
    const { username, email, password, country } = await registerSchema.validateAsync(req.body);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'Email already exists' } });
    }

    const newUser = await User.create({
      username,
      email,
      password, // Hook will hash it
      country: country || 'Unknown', // Default if not provided
      role_id: 5 // Default User Role
    });

    // Notify Admins
    await AdminNotification.create({
      admin_id: null,
      title: 'New User Registration',
      message: `User ${newUser.username} (${newUser.email}) has joined the platform.`,
      type: 'user_register'
    });

    // Auto login
    const tokens = generateTokens(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
        tokens
      }
    });

  } catch (error) {
    if (error.isJoi) return res.status(400).json({ success: false, error: { message: error.details[0].message } });
    console.error(error);
    return res.status(500).json({ success: false, error: { message: 'Registration failed' } });
  }
}

async function login(req, res) {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);

    const user = await User.findOne({ where: { email } });
    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const tokens = generateTokens(user);

    return res.json({
      success: true,
      data: {
        user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url },
        tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: { message: 'Login failed' } });
  }
}

module.exports = { register, login };
