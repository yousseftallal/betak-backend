const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'badges', key: 'id' }
  },
  awarded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'user_badges',
  timestamps: false
});

module.exports = UserBadge;
