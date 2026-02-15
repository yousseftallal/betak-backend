const { AdBanner, Wallet, WalletTransaction, User, sequelize } = require('../models');

async function seedFinancial() {
  try {
    console.log('🌱 Seeding Financial Data (Ads, Wallets, Transactions)...');

    // 1. Seed Ads
    const adsData = [
      {
        title: 'Premium Membership Promo',
        description: 'Get 50% off on your first month of Premium!',
        image_url: 'https://images.unsplash.com/photo-1628191139360-40396c0989f6?w=800&auto=format&fit=crop&q=60',
        link_url: 'https://betak.com/premium',
        active: true,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        created_at: new Date()
      },
      {
        title: 'Spring Festival Challenge',
        description: 'Participate in the Spring Festival and win exclusive badges.',
        image_url: 'https://images.unsplash.com/photo-1533241240441-1793bc43dd5d?w=800&auto=format&fit=crop&q=60',
        link_url: 'https://betak.com/events/spring',
        active: true,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        created_at: new Date()
      },
      {
        title: 'Legacy Ad (Inactive)',
        description: 'Old campaign.',
        image_url: 'https://placehold.co/600x400/gray/white?text=Expired',
        link_url: '#',
        active: false,
        valid_until: null,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // -60 days
      }
    ];

    await AdBanner.bulkCreate(adsData);
    console.log('✅ Ads seeded.');

    // 2. Wallets & Transactions
    const users = await User.findAll({ limit: 10 });
    
    if (users.length > 0) {
        for (const user of users) {
            // Create Wallet if not exists
            let wallet = await Wallet.findOne({ where: { user_id: user.id } });
            if (!wallet) {
                wallet = await Wallet.create({
                    user_id: user.id,
                    balance: Math.floor(Math.random() * 5000)
                });
            }

            // Create Transactions
            const txCount = Math.floor(Math.random() * 5) + 2; // 2-7 transactions
            const transactions = [];
            
            for (let i = 0; i < txCount; i++) {
                const type = Math.random() > 0.5 ? 'credit' : 'debit';
                const amount = Math.floor(Math.random() * 500) + 10;
                
                transactions.push({
                    wallet_id: wallet.id,
                    user_id: user.id,
                    amount: amount,
                    type: type,
                    description: type === 'credit' ? 'Gift Received' : 'Gift Sent',
                    status: 'completed',
                    reference_id: `SEED-${Math.floor(Math.random()*100000)}`,
                    created_at: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000))
                });
            }
            await WalletTransaction.bulkCreate(transactions);
        }
        console.log(`✅ Wallets & Transactions seeded for ${users.length} users.`);
    } else {
        console.log('⚠️ No users found for wallets.');
    }

    if (require.main === module) process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
    seedFinancial();
}

module.exports = seedFinancial;
