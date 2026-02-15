const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'conversations', key: 'id' }
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'video', 'audio'),
        defaultValue: 'text'
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['conversation_id'] },
        { fields: ['sender_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Message;
