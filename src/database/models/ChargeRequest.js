const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class ChargeRequest extends Model {}

ChargeRequest.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g. vodafone_cash, bank_transfer'
  },
  transaction_reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User provided transaction ID or phone number'
  },
  proof_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  generated_voucher_code: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'The voucher code generated upon approval'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  review_notes: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ChargeRequest',
  tableName: 'charge_requests',
  underscored: true,
  timestamps: true
});

module.exports = ChargeRequest;
