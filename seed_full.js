const { 
  sequelize, User, Creator, Video, Report, DailyStat, 
  AnalyticsSnapshot, Admin 
} = require('./src/database/models');
const bcrypt = require('bcryptjs');

// --- Random Helpers ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const firstNames = ['Ahmed', 'Mohamed', 'Sara', 'Fatima', 'Omar', 'Ali', 'Youssef', 'Layla', 'Nour', 'Khaled', 'Mona', 'Hassan'];
const lastNames = ['Hassan', 'Ibrahim', 'Ali', 'Mostafa', 'Osman', 'Saeed', 'Kamel', 'Nasser', 'Fawzy', 'Salem'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'betak.com'];
const videoTitles = ['Funny Cat Video', 'Amazing Travel Vlog', 'Cooking Pasta', 'Tech Review 2026', 'React Tutorial', 'Fitness Routine', 'Car Drift', 'Gaming Highlights'];
const descriptions = ['Check this out!', 'Please like and subscribe.', 'My daily routine.', 'Best tutorial ever.', 'Unbelievable moments.'];

const generateUser = (i) => ({
  username: `${randomPick(firstNames).toLowerCase()}_${randomPick(lastNames).toLowerCase()}${i}_${Date.now().toString().slice(-4)}`,
  email: `user${i}_${Math.floor(Math.random() * 100000)}_${Date.now()}@${randomPick(domains)}`,
  password_hash: '$2b$10$X7v/kZ7v/kZ7v/kZ7v/kZu', // Dummy hash
  country_code: randomPick(['EG', 'SA', 'AE', 'US', 'UK']),
  is_verified: Math.random() > 0.8,
  status: Math.random() > 0.9 ? 'suspended' : 'active',
  created_at: new Date(Date.now() - getRandomInt(0, 30*24*60*60*1000))
});

const generateCreator = (userId, username) => ({
  user_id: userId,
  username: username,
  bio: 'Just a content creator.',
  category: randomPick(['Entertainment', 'Education', 'Gaming', 'Lifestyle', 'Music']),
  status: 'active',
  total_earnings: getRandomInt(0, 5000),
  verification_status: Math.random() > 0.7 ? 'verified' : 'pending'
});

const generateVideo = (userId) => ({
  user_id: userId,
  title: `${randomPick(videoTitles)} #${getRandomInt(1,100)}`,
  description: randomPick(descriptions),
  video_url: 'http://example.com/video.mp4',
  thumbnail_url: 'http://example.com/thumb.jpg',
  duration: getRandomInt(15, 600),
  status: Math.random() > 0.1 ? 'active' : 'hidden',
  views_count: getRandomInt(10, 10000),
  likes_count: getRandomInt(0, 500),
  comments_count: getRandomInt(0, 50),
  created_at: new Date(Date.now() - getRandomInt(0, 7*24*60*60*1000))
});

async function seed() {
  const transaction = await sequelize.transaction();
  try {
    console.log('🌱 Starting Seed...');

    // 1. Users
    const usersData = Array.from({ length: 50 }).map((_, i) => generateUser(i));
    const users = await User.bulkCreate(usersData, { transaction, returning: true });
    console.log(`✅ ${users.length} Users created.`);

    // 2. Creators
    let creators = [];
    if (users.length > 0) {
        console.log('Sample User Keys:', Object.keys(users[0]));
        // Sequelize bulkCreate with returning: true returns instances
        const creatorsData = users.slice(0, 20).map(u => generateCreator(
            u.id || u.dataValues.id, 
            u.username || u.dataValues.username
        ));
        creators = await Creator.bulkCreate(creatorsData, { transaction, returning: true });
        console.log(`✅ ${creators.length} Creators created.`);

    } // Close if (users.length > 0)
    
    // 3. Videos
    let allVideos = [];
    for (const creator of creators) {
        const numVideos = getRandomInt(3, 15);
        // Video model needs user_id. The creator instance has user_id.
        const userId = creator.user_id || creator.dataValues.user_id;
        const videosData = Array.from({ length: numVideos }).map(() => generateVideo(userId));
        allVideos = [...allVideos, ...videosData];
    }
    const videos = await Video.bulkCreate(allVideos, { transaction, returning: true });
    console.log(`✅ ${videos.length} Videos created.`);

    // 4. Reports
    if (videos.length > 0 && users.length > 0) {
        const reportReasons = ['spam', 'inappropriate_content', 'harassment', 'copyright'];
        const reportsData = Array.from({ length: 15 }).map(() => {
            const reporter = users[getRandomInt(0, users.length - 1)];
            const video = videos[getRandomInt(0, videos.length - 1)];
            return {
                reporter_user_id: reporter.id || reporter.dataValues.id, 
                reported_type: 'video', 
                target_id: video.id || video.dataValues.id,
                reason: randomPick(reportReasons),
                status: 'pending',
                description: 'This video violates guidelines.'
            };
        });
        await Report.bulkCreate(reportsData, { transaction });
        console.log(`✅ ${reportsData.length} Reports created.`);
    }

    // 5. Daily Stats (Last 7 days)
    const statsData = Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        new_users: getRandomInt(5, 20),
        active_users: getRandomInt(50, 200),
        total_videos: 0, // Calculated ideally
        total_views: getRandomInt(500, 5000)
    }));
    await DailyStat.bulkCreate(statsData, { transaction });
    console.log(`✅ Daily stats seeded.`);

    await transaction.commit();
    console.log('🎉 Seeding Complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n\n❌ ❌ SEEDING FAILED ❌ ❌');
    console.error(error.message);
    if (error.original) console.error('Original DB Error:', error.original.message);
    console.error('Stack:', error.stack);
    await transaction.rollback();
    process.exit(1);
  }
}

seed();
