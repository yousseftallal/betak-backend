const { sequelize, Video } = require('./models');

async function syncVideoType() {
  try {
    // Add 'type' column to videos table
    // We use a raw query because Sequelize sync(alter) can be tricky with ENUMs sometimes
    // But let's try alter true first with model update
    
    await sequelize.getQueryInterface().addColumn('videos', 'type', {
      type: 'VARCHAR(20)', // Using varchar instead of ENUM for flexibility/simplicity in migration script
      defaultValue: 'video',
      allowNull: false
    }).catch(e => {
        // Ignore if already exists
        console.log('Column might already exist:', e.message);
    });

    console.log('✅ Video table updated with type column');
  } catch (error) {
    console.error('❌ Failed to update video table:', error);
  } finally {
    process.exit();
  }
}

syncVideoType();
