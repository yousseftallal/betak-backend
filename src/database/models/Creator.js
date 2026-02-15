const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Creator = sequelize.define('Creator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // One Creator profile per User
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  username: { // Copied for faster lookups/denormalization or unique creative handle
    type: DataTypes.STRING(50),
    allowNull: false
  },
  // --- Aggregated Stats (Synced via jobs/hooks) ---
  followers_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  following_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_videos: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  total_likes_received: { type: DataTypes.BIGINT, defaultValue: 0 },
  total_comments_received: { type: DataTypes.BIGINT, defaultValue: 0 },
  total_shares: { type: DataTypes.BIGINT, defaultValue: 0 },
  
  engagement_rate: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0,
    comment: 'Percentage: ((likes+comments+shares)/views) * 100'
  },
  avg_views_per_video: { type: DataTypes.FLOAT, defaultValue: 0 },
  avg_watch_time: { type: DataTypes.FLOAT, defaultValue: 0 },
  
  best_post_time: { 
    type: DataTypes.STRING(50), 
    allowNull: true, 
    comment: 'e.g. "Friday 18:00"'
  },
  revenue_earned: { 
    type: DataTypes.DECIMAL(15, 2), 
    defaultValue: 0.00 
  },
  
  last_active_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'creators',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['revenue_earned'] }, // For identifying top earners
    { fields: ['engagement_rate'] } // For filtering top creators
  ]
});

module.exports = Creator;
