const { sequelize, Comment } = require('./models');

async function syncComments() {
  try {
    // Force recreate comments table
    await Comment.sync({ force: true });
    console.log('✅ Comments table synced (recreated) successfully');
  } catch (error) {
    console.error('❌ Failed to sync comments:', error);
  } finally {
    process.exit();
  }
}

syncComments();
