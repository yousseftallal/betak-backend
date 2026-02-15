require('dotenv').config();
const { sequelize, Video, User } = require('./src/database/models');
const { Op } = require('sequelize');

async function replaceVideos() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        // 1. Delete old "Cartoon" videos (Google Storage samples)
        console.log('🗑️ Deleting old cartoon/sample videos...');
        await Video.destroy({
            where: {
                video_url: {
                    [Op.like]: '%gtv-videos-bucket%'
                }
            },
            force: true
        });

        // 2. Get Users
        const users = await User.findAll({ limit: 10 });
        if (users.length === 0) {
            console.log('⚠️ No users found to assign videos to.');
            return;
        }

        // 3. New Vertical/Real Video Sources (Mixkit & Pexels public samples)
        // Note: Using Mixkit preview URLs which are stable and public.
        const realVideos = [
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4", // Video as thumb
                caption: "أجواء المدينة الرائعة في الليل 🌃 #فلوق #سفر"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
                caption: "الطبيعة الخلابة والزهور 🌸 #طبيعة #حب"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-taking-coffee-Waitress-3972-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-taking-coffee-Waitress-3972-large.mp4",
                caption: "قهوة الصباح هي الأفضل ☕ #صباح_الخير #قهوة"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-winter-fashion-cold-looking-woman-concept-video-39874-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-winter-fashion-cold-looking-woman-concept-video-39874-large.mp4",
                caption: "موضة الشتاء لهذا العام ❄️ #موضة #ستايل"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4",
                caption: "الاستمتاع بالصيف والمسبح ☀️ #صيف #اجازة"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
                caption: "أحلى الأوقات مع العائلة 👨‍👩‍👧 #عائلة #حب"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-through-a-mountain-range-41576-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-through-a-mountain-range-41576-large.mp4",
                caption: "طريق السفر والمغامرة 🚗 #سيارات #سفر"
            },
            {
                url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
                thumb: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
                caption: "تجهيزات العيد والاحتفال 🎉 #احتفال #سعادة"
            }
        ];

        const newVideos = [];

        // Generate 24 videos
        for (let i = 0; i < 24; i++) {
            const source = realVideos[i % realVideos.length];
            const user = users[Math.floor(Math.random() * users.length)];

            newVideos.push({
                user_id: user.id,
                title: source.caption.split('#')[0].trim(),
                description: source.caption,
                video_url: source.url,
                thumbnail_url: source.thumb,
                type: 'video',
                status: 'active',
                views_count: Math.floor(Math.random() * 50000) + 1000,
                likes_count: Math.floor(Math.random() * 5000) + 100,
                comments_count: Math.floor(Math.random() * 200),
                shares_count: Math.floor(Math.random() * 100),
                duration: 15 + Math.floor(Math.random() * 30),
                created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            });
        }

        console.log('🎬 Seeding new REAL videos...');
        await Video.bulkCreate(newVideos);
        console.log(`✅ Added ${newVideos.length} new real videos.`);

    } catch (err) {
        console.error('Replacement failed:', err);
    } finally {
        await sequelize.close();
    }
}

replaceVideos();
