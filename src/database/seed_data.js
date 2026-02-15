/**
 * Seed Data Script
 * Creates demo roles, users, and videos for the Betak app
 * Run: node src/database/seed_data.js
 */
const { sequelize, User, Video, Role, Permission, RolePermission } = require('./models');
const bcrypt = require('bcryptjs');

// Sample Pexels video thumbnails (free to use)
const THUMBNAILS = [
    'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1142950/pexels-photo-1142950.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1194233/pexels-photo-1194233.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2878019/pexels-photo-2878019.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1580271/pexels-photo-1580271.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=400'
];

const AVATARS = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
    'https://randomuser.me/api/portraits/men/3.jpg',
    'https://randomuser.me/api/portraits/women/4.jpg',
    'https://randomuser.me/api/portraits/men/5.jpg',
    'https://randomuser.me/api/portraits/women/6.jpg',
    'https://randomuser.me/api/portraits/men/7.jpg',
    'https://randomuser.me/api/portraits/women/8.jpg',
    'https://randomuser.me/api/portraits/men/9.jpg',
    'https://randomuser.me/api/portraits/women/10.jpg',
    'https://randomuser.me/api/portraits/men/11.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/13.jpg',
    'https://randomuser.me/api/portraits/women/14.jpg',
    'https://randomuser.me/api/portraits/men/15.jpg',
];

// Sample video URL (short clip placeholder)
const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

const DEMO_USERS = [
    { username: 'ahmed_ali', email: 'ahmed@betak.live', bio: 'مصور فوتوغرافي 📸 | أسافر حول العالم', country: 'العراق', followers_count: 12500, following_count: 340, videos_count: 45, is_verified: true },
    { username: 'sara_mohammed', email: 'sara@betak.live', bio: 'طبخ وأكل شعبي 🍳 | وصفات كل يوم', country: 'العراق', followers_count: 8700, following_count: 210, videos_count: 78, is_verified: true },
    { username: 'omar_tech', email: 'omar@betak.live', bio: 'تكنولوجيا ومراجعات 💻 | أحدث الأجهزة', country: 'مصر', followers_count: 25000, following_count: 150, videos_count: 120, is_verified: true },
    { username: 'fatima_beauty', email: 'fatima@betak.live', bio: 'ميك اب وجمال 💄 | نصائح يومية', country: 'لبنان', followers_count: 15300, following_count: 420, videos_count: 95, is_verified: false },
    { username: 'hassan_fitness', email: 'hassan@betak.live', bio: 'مدرب لياقة بدنية 💪 | تمارين يومية', country: 'الأردن', followers_count: 9800, following_count: 180, videos_count: 67, is_verified: true },
    { username: 'noor_art', email: 'noor@betak.live', bio: 'فنانة رسم 🎨 | لوحات وإبداع', country: 'فلسطين', followers_count: 6200, following_count: 300, videos_count: 55, is_verified: false },
    { username: 'khalid_gaming', email: 'khalid@betak.live', bio: 'قيمر عربي 🎮 | بث مباشر يومياً', country: 'السعودية', followers_count: 31000, following_count: 90, videos_count: 200, is_verified: true },
    { username: 'lina_travel', email: 'lina@betak.live', bio: 'رحالة ومستكشفة ✈️ | أجمل الأماكن', country: 'الإمارات', followers_count: 18500, following_count: 250, videos_count: 88, is_verified: true },
    { username: 'youssef_comedy', email: 'youssef@betak.live', bio: 'كوميديان 😂 | ستاند أب ومحتوى ترفيهي', country: 'مصر', followers_count: 42000, following_count: 120, videos_count: 150, is_verified: true },
    { username: 'rania_fashion', email: 'rania@betak.live', bio: 'أزياء وموضة 👗 | ستايل عصري', country: 'المغرب', followers_count: 11200, following_count: 380, videos_count: 72, is_verified: false },
    { username: 'ali_sports', email: 'ali@betak.live', bio: 'رياضي ⚽ | أخبار وتحليلات', country: 'العراق', followers_count: 7600, following_count: 190, videos_count: 60, is_verified: false },
    { username: 'dina_health', email: 'dina@betak.live', bio: 'طبيبة 🩺 | نصائح صحية يومية', country: 'مصر', followers_count: 20300, following_count: 160, videos_count: 85, is_verified: true },
    { username: 'mustafa_cars', email: 'mustafa@betak.live', bio: 'عاشق السيارات 🚗 | مراجعات وأخبار', country: 'الكويت', followers_count: 14100, following_count: 220, videos_count: 93, is_verified: false },
    { username: 'huda_education', email: 'huda@betak.live', bio: 'معلمة 📚 | دروس وشروحات', country: 'تونس', followers_count: 16800, following_count: 280, videos_count: 110, is_verified: true },
    { username: 'zaid_music', email: 'zaid@betak.live', bio: 'موسيقي 🎵 | عزف وأغاني', country: 'الأردن', followers_count: 9300, following_count: 170, videos_count: 48, is_verified: false },
];

const VIDEO_TITLES = [
    'أفضل 10 أماكن سياحية في العراق 🇮🇶',
    'وصفة كبة موصلية أصلية 🍽️',
    'مراجعة iPhone 16 Pro Max - هل يستاهل؟ 📱',
    'تمرين كامل للجسم في 15 دقيقة 💪',
    'درس رسم - كيف ترسم وجه بالألوان المائية 🎨',
    'أجمل غروب شمس شفتوه! 🌅',
    'تحدي الأكل الحار 🌶️🔥',
    'جولة في مدينة أربيل القديمة',
    'نصائح للمقابلة الوظيفية ✅',
    'روتيني الصباحي اليومي ☀️',
    'كيف تبدأ مشروعك الخاص؟ 💼',
    'أسرار الطبخ العراقي 🍲',
    'مقارنة بين Samsung و iPhone 📊',
    'رحلة إلى شلالات بيخال الخلابة 🏞️',
    'ميك اب يومي سريع في 5 دقائق 💄',
    'أفضل تطبيقات 2026 📲',
    'وصفة دولمة عراقية تقليدية',
    'تعلم اللغة الإنجليزية - المحادثة اليومية 🗣️',
    'قمت بزيارة أقدم مسجد في بغداد 🕌',
    'موسيقى هادئة للدراسة والتركيز 🎶',
    'ردة فعلي على مباراة الكلاسيكو ⚽',
    'غرفتي الجديدة - Room Tour 🏠',
    'أخطاء شائعة في التصوير 📸',
    'حلويات رمضانية سهلة وسريعة 🍮',
    'تجربة أكل الشارع في إسطنبول 🇹🇷',
    'كيف أصبحت مشهوراً على بيتك؟ ⭐',
    'نصائح للعناية بالبشرة في الشتاء ❄️',
    'أغرب العادات حول العالم 🌍',
    'تحويل غرفة قديمة إلى استوديو 🎬',
    'يوم كامل من حياتي في بغداد',
];

const CATEGORIES = ['entertainment', 'education', 'food', 'tech', 'gaming', 'sports', 'beauty', 'travel', 'music', 'comedy'];

async function seedData() {
    try {
        console.log('🌱 Starting seed data...\n');

        // ─────────────────────────────────────────────
        // 1. Create 'User' role if not exists
        // ─────────────────────────────────────────────
        let userRole = await Role.findOne({ where: { name: 'User' } });
        if (!userRole) {
            userRole = await Role.create({
                name: 'User',
                description: 'Default app user role',
                is_active: true
            });
            console.log('✅ Created "User" role (id:', userRole.id, ')');
        } else {
            console.log('ℹ️  "User" role already exists (id:', userRole.id, ')');
        }

        // ─────────────────────────────────────────────
        // 2. Assign role to existing users that have null role_id
        // ─────────────────────────────────────────────
        const { Op } = require('sequelize');
        const nullRoleUsers = await User.update(
            { role_id: userRole.id },
            { where: { role_id: { [Op.is]: null } } }
        );
        if (nullRoleUsers[0] > 0) {
            console.log(`✅ Assigned "User" role to ${nullRoleUsers[0]} existing users (including Google sign-in users)`);
        }

        // ─────────────────────────────────────────────
        // 3. Create demo users
        // ─────────────────────────────────────────────
        const createdUserIds = [];
        for (let i = 0; i < DEMO_USERS.length; i++) {
            const u = DEMO_USERS[i];
            const existing = await User.findOne({ where: { email: u.email } });
            if (existing) {
                console.log(`ℹ️  User "${u.username}" already exists, skipping`);
                createdUserIds.push(existing.id);
                continue;
            }

            const hashedPw = await bcrypt.hash('Betak@2026', 10);
            const user = await User.create({
                username: u.username,
                email: u.email,
                password_hash: hashedPw,
                avatar_url: AVATARS[i % AVATARS.length],
                bio: u.bio,
                status: 'active',
                role_id: userRole.id,
                country: u.country,
                followers_count: u.followers_count,
                following_count: u.following_count,
                videos_count: u.videos_count,
                is_verified: u.is_verified,
                likes_received: Math.floor(Math.random() * 50000),
                last_active_at: new Date(),
                last_login_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // random last 7 days
            });
            createdUserIds.push(user.id);
            console.log(`✅ Created user: ${user.username} (ID: ${user.id})`);
        }

        // ─────────────────────────────────────────────
        // 4. Create demo videos
        // ─────────────────────────────────────────────
        const existingVideos = await Video.count();
        if (existingVideos >= 20) {
            console.log(`ℹ️  Already have ${existingVideos} videos, skipping video seeding`);
        } else {
            for (let i = 0; i < VIDEO_TITLES.length; i++) {
                const userId = createdUserIds[i % createdUserIds.length];
                const video = await Video.create({
                    user_id: userId,
                    title: VIDEO_TITLES[i],
                    description: `${VIDEO_TITLES[i]} - محتوى حصري على بيتك! شاركوا الفيديو مع أصدقائكم ❤️ #بيتك #محتوى_عربي`,
                    video_url: SAMPLE_VIDEO,
                    thumbnail_url: THUMBNAILS[i % THUMBNAILS.length],
                    status: 'active',
                    category: CATEGORIES[i % CATEGORIES.length],
                    type: 'video',
                    views_count: Math.floor(Math.random() * 100000) + 500,
                    likes_count: Math.floor(Math.random() * 10000) + 100,
                    shares_count: Math.floor(Math.random() * 2000) + 10,
                    comments_count: Math.floor(Math.random() * 500) + 5,
                    duration: Math.floor(Math.random() * 180) + 15, // 15-195 seconds
                    is_featured: i < 5 // First 5 are featured
                });
                console.log(`🎬 Created video: "${video.title.substring(0, 40)}..." (ID: ${video.id})`);
            }
        }

        // ─────────────────────────────────────────────
        // Summary
        // ─────────────────────────────────────────────
        const totalUsers = await User.count();
        const totalVideos = await Video.count();
        console.log('\n══════════════════════════════════════');
        console.log(`🎉 Seed complete!`);
        console.log(`   👤 Total users: ${totalUsers}`);
        console.log(`   🎬 Total videos: ${totalVideos}`);
        console.log(`   🔑 User role ID: ${userRole.id}`);
        console.log('══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed Error:', error);
        process.exit(1);
    }
}

seedData();
