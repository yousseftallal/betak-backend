const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    participant1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    participant2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    last_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    last_message_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['participant1_id'] },
        { fields: ['participant2_id'] },
        { fields: ['last_message_at'] },
        {
            unique: true,
            fields: ['participant1_id', 'participant2_id'],
            name: 'unique_conversation_pair'
        }
    ]
});

module.exports = Conversation;
