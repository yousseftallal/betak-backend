const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AdminActivityLog = sequelize.define('AdminActivityLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g., user.ban, video.delete, report.dismiss'
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'user, video, report, admin, etc.'
  },
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional action details (reason, duration, etc.)'
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'admin_activity_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
    { fields: ['resource_type', 'resource_id'] }
  ]
});

module.exports = AdminActivityLog;
