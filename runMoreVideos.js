require('dotenv').config();
const { sequelize } = require('./src/database/models');
const { seedMoreVideos } = require('./src/database/seeders/moreVideosSeeder');

async function run() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');
        await seedMoreVideos();
        console.log('Done.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await sequelize.close();
    }
}

run();
