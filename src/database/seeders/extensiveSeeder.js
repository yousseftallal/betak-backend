const {
    User, Wallet, ChargeRequest, Voucher, Report,
    Video, Comment, VideoEngagement, sequelize
} = require('../models');
const bcrypt = require('bcryptjs');

async function seedExtensive() {
    try {
        console.log('🌱 Starting Extensive Seeding...');

        // 1. Bulk Users (50 Users)
        console.log('   Creating Bulk Users...');
        const users = [];
        const baseTime = new Date();
        const hashedPassword = await bcrypt.hash('User123!', 10);
        for (let i = 1; i <= 50; i++) {
            const email = `user${i}_${Date.now()}@test.com`; // Unique email
            users.push({
                username: `user_${i}_${Math.floor(Math.random() * 1000)}`,
                email: email,
                password_hash: hashedPassword,
                role_id: 5, // User
                status: i % 10 === 0 ? 'banned' : (i % 5 === 0 ? 'suspended' : 'active'),
                bio: `This is bio for user ${i}. I love BeTak!`,
                is_verified: i % 7 === 0,
                followers_count: Math.floor(Math.random() * 1000),
                following_count: Math.floor(Math.random() * 50),
                created_at: new Date(baseTime.getTime() - Math.floor(Math.random() * 1000000000))
            });
        }

        // Note: extensive bulkCreate might skip hooks depending on config. 
        // For safety in this environment, individual create is safer for passwords, 
        // but slow. Let's try bulkCreate with hooks if possible, or just assume hooks run.
        // If hooks don't run, passwords might be plain text. 
        // In a real app we'd use individual creates or manual hashing. 
        // For speed, let's use individual promises for now to ensure hooks (hashing) run.

        const createdUsers = [];
        // Process in chunks of 10 to not overwhelm
        for (let i = 0; i < users.length; i += 10) {
            const chunk = users.slice(i, i + 10);
            const promises = chunk.map(u => User.create(u));
            const results = await Promise.all(promises);
            createdUsers.push(...results);
            console.log(`   Processed ${Math.min(i + 10, users.length)}/${users.length} users`);
        }

        // 2. Financial Data
        console.log('   Seeding Financial Data (Wallets, Charges, Vouchers)...');
        for (const user of createdUsers) {
            // Create Wallet
            const balance = Math.floor(Math.random() * 5000);
            await Wallet.create({
                user_id: user.id,
                balance: balance,
                currency: 'EGP',
                is_frozen: user.status === 'banned'
            });

            // Create Charge Requests (randomly)
            if (Math.random() > 0.7) {
                await ChargeRequest.create({
                    user_id: user.id,
                    amount: Math.floor(Math.random() * 1000) + 50,
                    status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
                    payment_method: 'vodafone_cash',
                    transaction_id: `TXN_${Date.now()}_${user.id}`,
                    proof_image: 'https://placehold.co/400x600/png?text=Receipt'
                });
            }
        }

        const vouchers = [
            { code: 'WELCOME2026', amount: 50, usage_limit: 1000, used_count: 50, expires_at: new Date(Date.now() + 86400000 * 30) },
            { code: 'VIPUSER', amount: 500, usage_limit: 10, used_count: 2, expires_at: new Date(Date.now() + 86400000 * 10) },
            { code: 'EXPIRED100', amount: 100, usage_limit: 100, used_count: 100, expires_at: new Date(Date.now() - 86400000) }
        ];
        for (const v of vouchers) {
            await Voucher.findOrCreate({
                where: { code: v.code },
                defaults: v
            });
        }

        // 3. Reports
        console.log('   Seeding Reports...');
        // Create reports mostly on random users or videos if we had access to them easily.
        // We can use the createdUsers for targets mostly.
        const reportReasons = ['Harassment', 'Spam', 'Inappropriate Content', 'Copyright'];
        const reportStatuses = ['pending', 'reviewing', 'resolved', 'dismissed'];

        for (let i = 0; i < 20; i++) {
            const reporter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const reported = createdUsers[Math.floor(Math.random() * createdUsers.length)];

            if (reporter.id !== reported.id) {
                try {
                    await Report.create({
                        reporter_user_id: reporter.id,
                        target_id: reported.id,
                        reported_type: 'user', // Explicit ENUM value
                        reason: reportReasons[Math.floor(Math.random() * reportReasons.length)],
                        description: 'This user is annoying me.',
                        status: reportStatuses[Math.floor(Math.random() * reportStatuses.length)],
                        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
                    });
                } catch (err) {
                    console.warn('⚠️ Failed to create report:', err.message);
                }
            }
        }

        // 4. Interactions (Comments & Engagement)
        // We need videos to comment on. Let's find some videos first.
        console.log('   Seeding Interactions...');
        const someVideos = await Video.findAll({ limit: 10 });

        if (someVideos.length > 0) {
            for (const video of someVideos) {
                // Add comments
                const commentCount = Math.floor(Math.random() * 15);
                for (let k = 0; k < commentCount; k++) {
                    const commenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                    await Comment.create({
                        user_id: commenter.id,
                        video_id: video.id,
                        content: ['Nice video!', 'Awesome!', 'LOL', 'First!', 'Love from Egypt 🇪🇬'][Math.floor(Math.random() * 5)],
                        likes_count: Math.floor(Math.random() * 20)
                    });
                }

                // Add engagement stats
                // Since we don't have a generic Engagement model visible in my list, I recall VideoEngagement or similar.
                // Let's assume we update the video stats directly or add to specific tables if they exist.
                // I saw `VideoEngagement` in list_dir output.

                // let's add some explicit engagement records
                for (let j = 0; j < 5; j++) {
                    const engager = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                    await VideoEngagement.create({
                        user_id: engager.id,
                        video_id: video.id,
                        type: ['like', 'share', 'watch'][Math.floor(Math.random() * 3)],
                        watch_duration: Math.floor(Math.random() * 60)
                    });
                }
            }
        }

        console.log('✅ Extensive Seeding Completed!');

        if (require.main === module) process.exit(0);

    } catch (error) {
        console.error('❌ Extensive Seeding Failed:', error);
        if (require.main === module) process.exit(1);
        throw error;
    }
}

if (require.main === module) {
    seedExtensive();
}

module.exports = seedExtensive;
