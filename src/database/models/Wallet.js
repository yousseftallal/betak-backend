const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class Wallet extends Model {}

Wallet.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'POINTS'
  },
  is_frozen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'wallets',
  underscored: true,
  timestamps: true
});

module.exports = Wallet;
