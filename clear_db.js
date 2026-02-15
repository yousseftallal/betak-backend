require('dotenv').config();
const {
    sequelize,
    User, Video, Comment, VideoEngagement, CreatorFollower, Creator,
    AdminActivityLog, Report, SupportTicket,
    CreatorDailyActivity, WalletTransaction,
    VerificationRequest, ChargeRequest, Sound, PushCampaign, AdminNotification
} = require('./src/database/models');

async function clearDatabase() {
    try {
        console.log('🗑️  Starting database cleanup (FORCE DELETE mode - Extended)...');

        // Disable foreign key checks to allow truncation
        await sequelize.query('SET session_replication_role = "replica";');

        console.log('Clearing Logistics & Logs...');
        if (AdminActivityLog) await AdminActivityLog.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (AdminNotification) await AdminNotification.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (PushCampaign) await PushCampaign.destroy({ where: {}, truncate: true, cascade: true, force: true });

        console.log('Clearing Reports & Tickets...');
        if (Report) await Report.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (SupportTicket) await SupportTicket.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (VerificationRequest) await VerificationRequest.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (ChargeRequest) await ChargeRequest.destroy({ where: {}, truncate: true, cascade: true, force: true });

        console.log('Clearing Analytics & Transactions...');
        if (CreatorDailyActivity) await CreatorDailyActivity.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (WalletTransaction) await WalletTransaction.destroy({ where: {}, truncate: true, cascade: true, force: true });

        console.log('Clearing User Content (Sounds, Engagement)...');
        if (Sound) await Sound.destroy({ where: {}, truncate: true, cascade: true, force: true });
        if (VideoEngagement) await VideoEngagement.destroy({ where: {}, truncate: true, cascade: true, force: true });

        console.log('Clearing Comments...');
        if (Comment) await Comment.destroy({ where: {}, truncate: true, cascade: true, force: true });

        console.log('Clearing Follows...');
        if (CreatorFollower) await CreatorFollower.destroy({ where: {}, truncate: true, cascade: true, force: true });

        console.log('Clearing Videos...');
        await Video.destroy({ where: {}, truncate: true, cascade: true, force: true });

        if (Creator) {
            console.log('Clearing Creator Profiles...');
            await Creator.destroy({ where: {}, truncate: true, cascade: true, force: true });
        }

        console.log('Clearing Users (cleaning everything)...');
        await User.destroy({ where: {}, truncate: true, cascade: true, force: true });

        // Enable foreign key checks
        await sequelize.query('SET session_replication_role = "origin";');

        console.log('✅ ALL Tables cleared Forcefully!');

        // Re-seed Roles
        console.log('🌱 Re-seeding Roles...');
        require('./seed_roles');

    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        // Wait a bit then close
        setTimeout(() => {
            console.log('Closing connection...');
            sequelize.close();
        }, 5000);
    }
}

clearDatabase();
