const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Sound = sequelize.define('Sound', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  artist: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cover_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  uses_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  plays_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trend_percentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  is_trending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null means system/admin, or we can link to User/Admin
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'sounds',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['is_trending'] },
    { fields: ['is_flagged'] }
  ]
});

module.exports = Sound;
