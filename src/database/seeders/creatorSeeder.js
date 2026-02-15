const { User, Creator, Video, VideoEngagement, CreatorRevenue, CreatorDailyActivity } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = async function seedCreators() {
  console.log('🌱 Seeding Creators & Analytics...');

  // 1. Create Top Creator
  const [topCreatorUser] = await User.findOrCreate({
    where: { email: 'ahmed@betak.com' },
    defaults: {
      username: 'Ahmed_Vlogs',
      password: 'User123!',
      role_id: 5, // User
      status: 'active',
      bio: 'Travel vlogger showing the beauty of Egypt 🇪🇬',
      is_verified: true,
      followers_count: 50000,
      following_count: 120,
      videos_count: 15,
      likes_received: 250000,
      shares_count: 5000,
      last_active_at: new Date()
    }
  });

  const [topCreatorProfile] = await Creator.findOrCreate({
    where: { user_id: topCreatorUser.id },
    defaults: {
      username: topCreatorUser.username,
      followers_count: 50000,
      following_count: 120,
      total_videos: 15,
      total_likes_received: 250000,
      total_comments_received: 12000,
      total_shares: 5000,
      engagement_rate: 8.5,
      avg_views_per_video: 45000,
      avg_watch_time: 125.5, // seconds
      best_post_time: 'Friday 20:00',
      revenue_earned: 15000.50,
      last_active_at: new Date()
    }
  });

  // 2. Create Videos for Top Creator
  // Check if video exists
  let video1 = await Video.findOne({ where: { user_id: topCreatorUser.id, title: 'Visit Pyramids of Giza 🐫' } });
  
  if (!video1) {
    video1 = await Video.create({
        user_id: topCreatorUser.id,
        title: 'Visit Pyramids of Giza 🐫',
        description: 'Amazing tour inside the Great Pyramid!',
        video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
        thumbnail_url: 'https://images.unsplash.com/photo-1568511720810-498c8c679942?q=80&w=600&auto=format&fit=crop', 
        status: 'active',
        category: 'travel',
        views_count: 100000,
        likes_count: 15000,
        comments_count: 800,
        shares_count: 1200,
        watch_time_total: 12500000, 
        avg_watch_time: 125,
        peak_time: '18:45',
        duration: 180, 
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
    });

    // 3. Create Revenue Records only if video was just created (to avoid dupes)
    await CreatorRevenue.bulkCreate([
        { creator_id: topCreatorProfile.id, video_id: video1.id, amount: 500.00, type: 'ads' },
        { creator_id: topCreatorProfile.id, video_id: video1.id, amount: 1000.00, type: 'sponsorship' },
        { creator_id: topCreatorProfile.id, amount: 50.00, type: 'gift' }
    ]);
  }

  // 4. Create Daily Activity (check existing first to prevent bloat on re-run)
  const existingActivity = await CreatorDailyActivity.findOne({ where: { creator_id: topCreatorProfile.id } });
  if (!existingActivity) {
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        await CreatorDailyActivity.create({
        creator_id: topCreatorProfile.id,
        date: date,
        new_videos: i === 6 ? 1 : 0,
        new_followers: 100 + (i * 10),
        likes_received: 500 + (i * 50),
        shares_received: 20 + i,
        comments_received: 50 + i,
        watch_time_total: 10000 + (i * 1000)
        });
    }
  }

  // 5. Create Another Creator (Tech Reviewer)
  const [techUser] = await User.findOrCreate({
     where: { email: 'tech@betak.com' },
     defaults: {
        username: 'TechMaster',
        password: 'User123!',
        status: 'active',
        is_verified: true,
        followers_count: 12000,
        videos_count: 5
     }
  });

  await Creator.findOrCreate({
      where: { user_id: techUser.id },
      defaults: {
        username: techUser.username,
        followers_count: 12000,
        total_videos: 5,
        engagement_rate: 5.2,
        revenue_earned: 3200.00
      }
  });

  console.log('✅ Creators seeded successfully!');
};
