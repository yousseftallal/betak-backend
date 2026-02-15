const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const StoryView = sequelize.define('StoryView', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    story_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'stories', key: 'id' }
    },
    viewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'story_views',
    timestamps: false,
    underscored: true,
    indexes: [
        { fields: ['story_id'] },
        { fields: ['viewer_id'] },
        {
            unique: true,
            fields: ['story_id', 'viewer_id'],
            name: 'unique_story_view'
        }
    ]
});

module.exports = StoryView;
