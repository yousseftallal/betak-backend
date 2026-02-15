const { Video, User } = require('../models');
const { Op } = require('sequelize');

async function seedMoreVideos() {
    console.log('🎬 Seeding MORE videos...');

    // 1. Get some users to assign videos to
    const users = await User.findAll({ limit: 10 });
    if (users.length === 0) {
        console.log('❌ No users found. Run user seeder first.');
        return;
    }

    // 2. High Quality Video Sources (Google Storage Samples)
    const videoSources = [
        {
            title: "Big Buck Bunny",
            description: "A funny animated movie about a giant rabbit.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        },
        {
            title: "Elephant Dream",
            description: "The first open movie from Blender Foundation.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
        },
        {
            title: "For Bigger Blazes",
            description: "Action-packed scenes with high contrast.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
        },
        {
            title: "For Bigger Escapes",
            description: "Relaxing nature and cinematic shots.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
        },
        {
            title: "For Bigger Fun",
            description: "Having fun in the city.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg"
        },
        {
            title: "For Bigger Joyrides",
            description: "Driving through the mountains.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg"
        },
        {
            title: "For Bigger Meltdowns",
            description: "Cinematic timelapse of a city.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg"
        },
        {
            title: "Sintel",
            description: "A fantasy movie about a girl and her dragon.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg"
        },
        {
            title: "Subaru Outback On Street And Dirt",
            description: "Car commercial style video.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg"
        },
        {
            title: "Tears of Steel",
            description: "Sci-fi movie with great VFX.",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg"
        }
    ];

    const videos = [];

    // Create 20 videos (cycling through sources)
    for (let i = 0; i < 20; i++) {
        const source = videoSources[i % videoSources.length];
        const user = users[Math.floor(Math.random() * users.length)];

        videos.push({
            user_id: user.id,
            title: i < videoSources.length ? source.title : `${source.title} (${i})`,
            description: source.description,
            video_url: source.url,
            thumbnail_url: source.thumb,
            type: 'video',
            status: 'active',
            views_count: Math.floor(Math.random() * 50000),
            likes_count: Math.floor(Math.random() * 2000),
            comments_count: Math.floor(Math.random() * 100),
            shares_count: Math.floor(Math.random() * 500),
            duration: 60 + Math.floor(Math.random() * 120),
            created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random time in last ~10 days
        });
    }

    await Video.bulkCreate(videos);

    console.log(`✅ Seeded ${videos.length} new videos successfully!`);
}

module.exports = { seedMoreVideos };
