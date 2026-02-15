const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Comment = sequelize.define('Comment', {
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
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000] // Max 1000 chars
    }
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['video_id'] }, // Fetch comments for video
    { fields: ['user_id'] }
  ]
});

module.exports = Comment;
