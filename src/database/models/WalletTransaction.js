const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'wallets',
      key: 'id'
    }
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
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External reference or related entity ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'completed'
  }
}, {
  tableName: 'wallet_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = WalletTransaction;
