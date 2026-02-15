const { User, VerificationRequest, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function seedVerification() {
  try {
    console.log('🌱 Seeding Verification Requests...');

    const transaction = await sequelize.transaction();

    try {
      // 1. Create Users for Verification
      const usersData = [
        {
          username: 'sarah_official_v',
          email: 'sarah.v@betak.com',
          full_name: 'Sarah Jenkins',
          role_id: 5,
        },
        {
          username: 'tech_guru_v',
          email: 'tech.v@betak.com',
          full_name: 'Mike Ross',
          role_id: 5,
        },
        {
          username: 'fashion_daily_v',
          email: 'emma.v@betak.com',
          full_name: 'Emma Clark',
          role_id: 5,
        },
        {
          username: 'rejected_user_v',
          email: 'john.v@betak.com',
          full_name: 'John Doe',
          role_id: 5,
        },
      ];

      const users = [];

      for (const userData of usersData) {
        // Check if user exists to avoid unique constraint error
        let user = await User.findOne({ where: { email: userData.email }, transaction });
        if (!user) {
          user = await User.create({
            ...userData,
            password: 'User123!',
            status: 'active',
            is_verified: false,
            followers_count: Math.floor(Math.random() * 100000)
          }, { transaction });
        }
        users.push(user);
      }

      // 2. Create Verification Requests
      const requestsData = [
        {
          user_id: users[0].id,
          full_name: 'Sarah Jenkins',
          category: 'Creator',
          document_type: 'Passport',
          document_url: 'https://example.com/passport.jpg',
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          user_id: users[1].id,
          full_name: 'Mike Ross',
          category: 'Technology',
          document_type: 'Driver License',
          document_url: 'https://example.com/license.png',
          status: 'pending',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          user_id: users[2].id,
          full_name: 'Emma Clark',
          category: 'Fashion',
          document_type: 'ID Card',
          document_url: 'https://example.com/id.jpg',
          status: 'approved',
          reviewed_by: 1, // Assumes admin ID 1 exists
          reviewed_at: new Date(),
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          user_id: users[3].id,
          full_name: 'John Doe',
          category: 'Personal',
          document_type: 'Passport',
          document_url: 'https://example.com/passport_fake.jpg',
          status: 'rejected',
          admin_notes: 'Document unclear',
          reviewed_by: 1,
          reviewed_at: new Date(),
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const reqData of requestsData) {
        // Check if request already exists for this user
        const existing = await VerificationRequest.findOne({ where: { user_id: reqData.user_id }, transaction });
        if (!existing) {
          await VerificationRequest.create(reqData, { transaction });
        }
      }

      await transaction.commit();
      console.log('✅ Verification requests seeded successfully!');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (require.main === module) process.exit(1);
    throw error;
  }
}

if (require.main === module) {
  seedVerification();
}

module.exports = seedVerification;
