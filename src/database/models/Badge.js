const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  criteria: {
    type: DataTypes.STRING(255), // e.g. "manual", "1000_views"
    defaultValue: 'manual'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'badges',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Badge;
