const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const LiveStream = sequelize.define('LiveStream', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Untitled Stream'
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  stream_key: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  viewers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('live', 'ended', 'banned'),
    defaultValue: 'live'
  },
  reports_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'live_streams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = LiveStream;
