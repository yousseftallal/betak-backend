const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const VerificationRequest = sequelize.define('VerificationRequest', {
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
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // e.g., 'Creator', 'Company', 'Public Figure', 'Media', 'Other'
  },
  document_type: {
    type: DataTypes.STRING(50),
    allowNull: false
    // e.g., 'Passport', 'ID Card', 'Driver License'
  },
  document_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'admins', key: 'id' }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'verification_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = VerificationRequest;
