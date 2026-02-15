const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AdBanner = sequelize.define('AdBanner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  link_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  valid_from: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'ad_banners',
  timestamps: true
});

module.exports = AdBanner;
