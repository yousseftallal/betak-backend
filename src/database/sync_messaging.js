/**
 * Sync messaging and stories tables to the database
 * Run: node src/database/sync_messaging.js
 */
const { sequelize, Conversation, Message, Story, StoryView } = require('./models');

async function syncMessagingTables() {
    try {
        console.log('🔄 Syncing messaging and stories tables...');

        // Create tables if they don't exist (alter: true adds missing columns)
        await Conversation.sync({ alter: true });
        console.log('✅ Conversations table synced');

        await Message.sync({ alter: true });
        console.log('✅ Messages table synced');

        await Story.sync({ alter: true });
        console.log('✅ Stories table synced');

        await StoryView.sync({ alter: true });
        console.log('✅ StoryViews table synced');

        console.log('\n🎉 All messaging and stories tables synced successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncMessagingTables();
