const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DailyStat = sequelize.define('DailyStat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  new_users: { type: DataTypes.INTEGER, defaultValue: 0 },
  new_videos: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_views: { type: DataTypes.BIGINT, defaultValue: 0 },
  total_likes: { type: DataTypes.BIGINT, defaultValue: 0 },
  total_shares: { type: DataTypes.BIGINT, defaultValue: 0 },
  total_comments: { type: DataTypes.BIGINT, defaultValue: 0 }
}, {
  tableName: 'daily_stats',
  timestamps: false,
  indexes: [
    { fields: ['date'] }
  ]
});

module.exports = DailyStat;
