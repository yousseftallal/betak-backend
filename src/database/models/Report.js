const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // In Phase 2: 'type' (USER, VIDEO, COMMENT)
  reported_type: {
    type: DataTypes.ENUM('user', 'video', 'comment'), // Added 'comment'
    allowNull: false
  },
  target_id: { // Renamed from reported_id to match request, or aliased
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'reported_id' // Keeping DB column name but mapping to target_id logical concept if needed, sticking to old code for stability
  },
  // Who reported it
  reporter_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  reason: { type: DataTypes.STRING(100), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'resolved', 'ignored', 'dismissed'), // Added 'ignored'
    defaultValue: 'pending'
  },
  
  // Phase 1 legacy fields kept for compatibility
  category: { type: DataTypes.STRING(50), allowNull: true }, 
  description: { type: DataTypes.TEXT, allowNull: true },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  
  assigned_admin_id: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' }
  },
  reviewed_at: { type: DataTypes.DATE, allowNull: true },
  reviewed_by: { type: DataTypes.INTEGER, references: { model: 'admins', key: 'id' } },
  moderator_notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
     { fields: ['status'] },
     { fields: ['reported_type', 'reported_id'] }
  ]
});

module.exports = Report;
