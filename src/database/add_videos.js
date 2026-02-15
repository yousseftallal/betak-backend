const { User, Video, sequelize } = require('./models');

const sampleVideos = [
    { title: 'Funny Cat Fails', category: 'comedy', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
    { title: 'Learn React in 100 Seconds', category: 'education', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { title: 'Amazing Sunset in Cairo', category: 'travel', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    { title: 'Best Burger Recipe', category: 'food', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
    { title: 'Morning Workout Routine', category: 'fitness', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
    { title: 'Guitar Solo Performance', category: 'music', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { title: 'Tech Review: iPhone 16', category: 'tech', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { title: 'Street Food Tour', category: 'food', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
    { title: 'Gaming Highlights #1', category: 'gaming', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
    { title: 'Motivation for 2026', category: 'lifestyle', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4' }
];

async function addVideos() {
    try {
        console.log('📽️  Adding videos to database...');
        
        const users = await User.findAll({ limit: 50 });
        if (users.length === 0) {
            console.log('⚠️ No users found! Please run seeders first.');
            return;
        }

        const videosToCreate = [];
        // Generate 30 videos
        for (let i = 0; i < 30; i++) {
            const template = sampleVideos[i % sampleVideos.length];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            
            videosToCreate.push({
                user_id: randomUser.id,
                title: `${template.title} #${i+1}`,
                description: `This is a description for ${template.title}. Enjoy watching!`,
                video_url: template.url,
                thumbnail_url: `https://placehold.co/600x400/png?text=Video+${i+1}`,
                category: template.category,
                views_count: Math.floor(Math.random() * 100000),
                likes_count: Math.floor(Math.random() * 5000),
                shares_count: Math.floor(Math.random() * 500),
                duration: Math.floor(Math.random() * 300) + 30, // 30s to 330s
                status: 'active'
            });
        }

        await Video.bulkCreate(videosToCreate);
        console.log(`✅ Successfully added ${videosToCreate.length} videos!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add videos:', error);
        process.exit(1);
    }
}

addVideos();
