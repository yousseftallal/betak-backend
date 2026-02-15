const { PushCampaign, AdminNotification, sequelize } = require('../models');

async function seedNotifications() {
  try {
    console.log('🌱 Seeding Notifications...');

    // Push Campaigns
    const campaigns = [
        {
            title: 'New Feature Alert!',
            message: 'Check out the new Live stream filters.',
            target_audience: 'all',
            status: 'sent',
            sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
            title: 'Maintenance Window',
            message: 'We will be down for 30 mins tonight.',
            target_audience: 'all',
            status: 'sent',
            sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
            title: 'Creator Bonus',
            message: 'You have qualified for the monthly bonus!',
            target_audience: 'creators',
            status: 'scheduled',
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        }
    ];
    await PushCampaign.bulkCreate(campaigns);

    // Admin Alerts (System Notifications)
    const alerts = [
        {
            title: 'High Load Warning',
            message: 'Server CPU usage exceeded 80% for 5 minutes.',
            type: 'warning',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            title: 'New Verification Request',
            message: 'User @cool_streamer requested verification.',
            type: 'info',
            link: '/verification',
            created_at: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            title: 'Report Escalation',
            message: 'Multiple reports received for video #1234.',
            type: 'error',
            link: '/reports', // Assuming report page exists or will exist
            created_at: new Date(Date.now() - 10 * 60 * 1000)
        }
    ];
    await AdminNotification.bulkCreate(alerts);

    console.log('✅ Notifications seeded successfully!');
    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
    seedNotifications();
}

module.exports = seedNotifications;
