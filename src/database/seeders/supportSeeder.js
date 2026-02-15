const { SupportTicket, User, sequelize } = require('../models');

async function seedSupport() {
  try {
    console.log('🌱 Seeding Support Tickets...');
    
    // Get some users
    const users = await User.findAll({ limit: 5 });
    if (users.length === 0) {
        console.log('⚠️ No users found to attach tickets to. Skipping.');
        return;
    }

    const ticketsData = [
        {
            user_id: users[0].id,
            subject: 'Account Banned Unfairly',
            category: 'Appeal',
            message: 'I was banned during my live stream but I did not violate any rules. Please review.',
            priority: 'high',
            status: 'open',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            user_id: users[1] ? users[1].id : users[0].id,
            subject: 'How to monetize?',
            category: 'General',
            message: 'I have reached 10k followers. How do I enable ads?',
            priority: 'medium',
            status: 'open',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
            user_id: users[2] ? users[2].id : users[0].id,
            subject: 'Copyright Strike Issue',
            category: 'Copyright',
            message: 'My video was muted but I own the rights to the music.',
            priority: 'high',
            status: 'in-progress',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
            user_id: users[0].id,
            subject: 'Bug in upload',
            category: 'Technical',
            message: 'Video upload stuck at 99%.',
            priority: 'low',
            status: 'closed',
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
        }
    ];

    await SupportTicket.bulkCreate(ticketsData);
    
    console.log('✅ Support Tickets seeded successfully!');
    if (require.main === module) process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
    seedSupport();
}

module.exports = seedSupport;
