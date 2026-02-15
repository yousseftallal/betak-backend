const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CreatorRevenue = sequelize.define('CreatorRevenue', {
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
  video_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be general sponsorship not tied to a specific video
    references: { model: 'videos', key: 'id' },
    onDelete: 'SET NULL'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('ads', 'sponsorship', 'gift'),
    allowNull: false
  }
}, {
  tableName: 'creator_revenues',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
  indexes: [
    { fields: ['creator_id'] },
    { fields: ['type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = CreatorRevenue;
