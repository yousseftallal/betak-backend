const { LiveStream, User } = require('../models');

async function seedLiveStreams() {
  try {
    console.log('🌱 Seeding Live Streams...\n');

    // Get some users
    const users = await User.findAll({ limit: 5 });
    if (users.length === 0) {
      console.log('Please seed users first.');
      return;
    }

    const streams = [
      {
        user_id: users[0 % users.length].id,
        title: 'Morning Vibes ☀️',
        thumbnail_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=600&auto=format&fit=crop',
        viewers_count: 1250,
        status: 'live'
      },
      {
        user_id: users[1 % users.length].id,
        title: 'Gaming Marathon 🎮',
        thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
        viewers_count: 8900,
        status: 'live'
      },
      {
        user_id: users[2 % users.length].id,
        title: 'Cooking Challenge 🍳',
        thumbnail_url: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=600&auto=format&fit=crop',
        viewers_count: 450,
        status: 'live'
      },
      {
         user_id: users[3 % users.length].id,
         title: 'Just Chatting',
         thumbnail_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
         viewers_count: 120,
         status: 'live'
      },
      {
        user_id: users[4 % users.length].id,
        title: 'Live Music Session 🎵',
        thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        viewers_count: 3200,
        status: 'live'
      },
      // New streams
      {
        user_id: users[5 % users.length].id, // Reusing user
        title: 'Late Night Talk 🌙',
        thumbnail_url: 'https://images.unsplash.com/photo-1576723659439-d8e73307cb81?q=80&w=600&auto=format&fit=crop',
        viewers_count: 5600,
        reports_count: 5,
        status: 'live'
      },
      {
        user_id: users[6 % users.length].id, // Reusing user
        title: 'Coding Bootcamp 💻',
        thumbnail_url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600&auto=format&fit=crop',
        viewers_count: 150,
        status: 'live'
      }
    ];

    await LiveStream.bulkCreate(streams);

    console.log('✅ Live Streams seeded successfully!\n');
    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Live Stream seeding failed:', error);
    if (require.main === module) process.exit(1);
    throw error;
  }
}

if (require.main === module) {
  seedLiveStreams();
}

module.exports = seedLiveStreams;
