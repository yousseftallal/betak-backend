const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 'creator_id' in prompt, typically maps to user_id in DB relation
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted', 'published'), // Added 'active' to match prompt
    defaultValue: 'active'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'general'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  type: {
      type: DataTypes.STRING(20), // 'video', 'image', 'text'
      allowNull: false,
      defaultValue: 'video'
  },
  // --- Metrics ---
  views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  shares_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  // --- Advanced Analytics ---
  watch_time_total: { 
    type: DataTypes.BIGINT, // Using BigInt for total seconds as this can grow large
    defaultValue: 0,
    comment: 'Total watch time in seconds'
  },
  avg_watch_time: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0,
    comment: 'Average watch time in seconds' 
  },
  peak_time: { 
    type: DataTypes.STRING(20), // e.g., "20:00" or timestamp
    allowNull: true,
    comment: 'Time of day with highest engagement'
  },
  
  duration: { type: DataTypes.INTEGER, allowNull: true }, // Duration of video itself
  resolution: { type: DataTypes.STRING(20), allowNull: true },
  
  reports_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'videos',
  timestamps: true,
  paranoid: true, // For 'deleted' status soft-delete simulation
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['views_count'] }
  ]
});

module.exports = Video;
