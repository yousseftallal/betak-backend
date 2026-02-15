const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// This matches "5. Creator Followers" in request.
// It's a through-table for User<->Creator (Follower<->Followed)
const CreatorFollower = sequelize.define('CreatorFollower', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'creators', key: 'id' },
    onDelete: 'CASCADE'
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  followed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'creator_followers',
  timestamps: false, // We use followed_at explicitly
  indexes: [
    { fields: ['creator_id'] },
    { fields: ['follower_id'] },
    { unique: true, fields: ['creator_id', 'follower_id'] } // Prevent double follow
  ]
});

module.exports = CreatorFollower;
