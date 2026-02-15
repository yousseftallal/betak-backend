const { Sound, sequelize } = require('../models');

async function seedSounds() {
  try {
    console.log('🌱 Seeding Sounds...');

    const sounds = [
        {
            title: 'Summer Vibes',
            artist: 'Official Sound',
            duration: 15,
            file_url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/race1.ogg',
            uses_count: 1200000,
            trend_percentage: 15.0,
            is_trending: false,
            is_flagged: false
        },
        {
            title: 'Funny Laugh',
            artist: 'User123',
            duration: 5,
            file_url: 'http://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a',
            uses_count: 850000,
            trend_percentage: -2.0,
            is_trending: false,
            is_flagged: false
        },
        {
            title: 'Epic Challenge',
            artist: 'BeTak Originals',
            duration: 30,
            file_url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/eatedible.ogg',
            uses_count: 2500000,
            trend_percentage: 45.0,
            is_trending: true,
            is_flagged: false
        },
        {
            title: 'Copyrighted Hit',
            artist: 'Unknown',
            duration: 45,
            file_url: 'http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3',
            uses_count: 10000,
            trend_percentage: 0.0,
            is_trending: false,
            is_flagged: true
        },
        {
            title: 'Dance Beat 2024',
            artist: 'DJ Cool',
            duration: 60,
            file_url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/race2.ogg',
            uses_count: 500000,
            trend_percentage: 8.0,
            is_trending: false,
            is_flagged: false
        }
    ];

    await Sound.bulkCreate(sounds);
    console.log('✅ Sounds seeded successfully!');

    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  seedSounds();
}

module.exports = seedSounds;
