const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PushCampaign = sequelize.define('PushCampaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target_audience: {
    type: DataTypes.ENUM('all', 'creators', 'specific'),
    defaultValue: 'all'
  },
  target_ids: {
    type: DataTypes.JSONB, // Store array of IDs if specific
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sent', 'failed'),
    defaultValue: 'draft'
  },
  scheduled_for: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' }
  }
}, {
  tableName: 'push_campaigns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PushCampaign;
