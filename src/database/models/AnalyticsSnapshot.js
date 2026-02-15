const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AnalyticsSnapshot = sequelize.define('AnalyticsSnapshot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  snapshot_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'daily_stats, hourly_stats, weekly_stats'
  },
  snapshot_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  snapshot_hour: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 23
    }
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Pre-aggregated metrics to avoid heavy queries'
  }
}, {
  tableName: 'analytics_snapshots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['snapshot_type', 'snapshot_date'] },
    { fields: ['snapshot_date'] }
  ]
});

module.exports = AnalyticsSnapshot;
