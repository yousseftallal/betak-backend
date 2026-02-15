require('dotenv').config();
const { sequelize } = require('./src/database/models');
const { Video } = require('./src/database/models');
const { Op } = require('sequelize');

async function cleanBrokenVideos() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        // Find videos with localhost in URL
        const brokenVideos = await Video.findAll({
            where: {
                video_url: {
                    [Op.like]: '%localhost%'
                }
            }
        });

        console.log(`Found ${brokenVideos.length} broken videos (localhost).`);

        if (brokenVideos.length > 0) {
            await Video.destroy({
                where: {
                    video_url: {
                        [Op.like]: '%localhost%'
                    }
                },
                force: true // Hard delete to really get rid of them
            });
            console.log('✅ Deleted broken videos.');
        } else {
            console.log('No broken videos found.');
        }

    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        await sequelize.close();
    }
}

cleanBrokenVideos();
