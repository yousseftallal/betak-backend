const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AdminSession = sequelize.define('AdminSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  refresh_token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  access_token_jti: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'admin_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AdminSession;
