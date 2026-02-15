const { sequelize } = require('./models');

async function addFeaturedColumn() {
  try {
    console.log('Adding is_featured column to videos table...');
    
    await sequelize.query(`
      ALTER TABLE videos 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
    `);

    console.log('Column added successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update schema:', error);
    process.exit(1);
  }
}

addFeaturedColumn();
