const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const VideoEngagement = sequelize.define('VideoEngagement', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  video_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'videos', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Nullable for anonymous views? Often not allowed but safer
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'share', 'watch'),
    allowNull: false
  },
  watch_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Duration in seconds (only for type=watch)'
  }
}, {
  tableName: 'video_engagements',
  timestamps: true,
  updatedAt: false, // Immutable log
  createdAt: 'created_at',
  indexes: [
    { fields: ['video_id', 'type'] }, // Fast count queries
    { fields: ['user_id'] },
    { fields: ['created_at'] } // For time-series analytics
  ]
});

module.exports = VideoEngagement;
