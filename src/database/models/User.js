const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { len: [3, 50] }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: { // Using 'password' as per request, mapped to password_hash
    type: DataTypes.VIRTUAL,
    set(value) {
      this.setDataValue('password', value);
      // Hash is set via hook
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Changed to true to decouple from strict Role dependency
    references: { model: 'roles', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    defaultValue: 'active'
  },
  suspension_expires_at: { type: DataTypes.DATE, allowNull: true },
  live_ban_expires_at: { type: DataTypes.DATE, allowNull: true },
  // --- Profile Fields ---
  bio: { type: DataTypes.TEXT, allowNull: true },
  avatar_url: { type: DataTypes.STRING(500), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  country_code: { type: DataTypes.STRING(2), allowNull: true },
  country: { type: DataTypes.STRING(100), allowNull: true }, // Added for analytics

  // --- Analytics Fields (Phase 2 Upgrade) ---
  followers_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  following_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  videos_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes_received: { type: DataTypes.INTEGER, defaultValue: 0 },
  shares_count: { type: DataTypes.INTEGER, defaultValue: 0 },

  last_active_at: { type: DataTypes.DATE, allowNull: true },
  last_login_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['followers_count'] } // Good for sorting influencers
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      // If updating directly via password_hash (not common but kept for compatibility)
      if (user.changed('password_hash') && !user.password_hash.startsWith('$2a$')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = User;
