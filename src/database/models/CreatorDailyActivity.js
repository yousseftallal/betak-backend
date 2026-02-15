const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CreatorDailyActivity = sequelize.define('CreatorDailyActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'creators', key: 'id' },
    onDelete: 'CASCADE'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  new_videos: { type: DataTypes.INTEGER, defaultValue: 0 },
  new_followers: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes_received: { type: DataTypes.INTEGER, defaultValue: 0 },
  shares_received: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments_received: { type: DataTypes.INTEGER, defaultValue: 0 },
  watch_time_total: { type: DataTypes.BIGINT, defaultValue: 0 }
}, {
  tableName: 'creator_daily_activities',
  timestamps: false,
  indexes: [
    { fields: ['creator_id', 'date'], unique: true },
    { fields: ['date'] }
  ]
});

module.exports = CreatorDailyActivity;
