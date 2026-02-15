const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Story = sequelize.define('Story', {
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
    media_url: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    media_type: {
        type: DataTypes.ENUM('image', 'video'),
        defaultValue: 'image'
    },
    text_overlay: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    background_color: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'stories',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['expires_at'] },
        { fields: ['is_active'] }
    ]
});

module.exports = Story;
