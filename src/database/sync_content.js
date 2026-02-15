const { 
  User, Video, Creator, VideoEngagement, Comment, Report, 
  LiveStream, VerificationRequest, CreatorRevenue, CreatorDailyActivity, 
  Wallet, ChargeRequest, Voucher, sequelize 
} = require('./models');

async function syncContent() {
  try {
    console.log('🔄 Syncing Content & User Tables...');
    
    // Sync independent models first
    await User.sync({ alter: true });
    
    // Sync dependent models
    await Creator.sync({ alter: true });
    await Video.sync({ alter: true }); // Depends on User
    await Comment.sync({ alter: true }); // Depends on User, Video
    await VideoEngagement.sync({ alter: true }); // Depends on User, Video
    await Report.sync({ alter: true }); // Depends on User
    await LiveStream.sync({ alter: true }); // Depends on User
    await VerificationRequest.sync({ alter: true }); // Depends on User
    
    // Creator stuff
    await CreatorRevenue.sync({ alter: true });
    await CreatorDailyActivity.sync({ alter: true });
    
    // Financial stuff (just in case)
    await Wallet.sync({ alter: true });
    await ChargeRequest.sync({ alter: true });
    await Voucher.sync({ alter: true });

    console.log('✅ Content & User tables synced.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncContent();
