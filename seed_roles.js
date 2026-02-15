require('dotenv').config();
const { sequelize, Role } = require('./src/database/models');

async function checkAndSeedRoles() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const count = await Role.count();
        console.log(`📊 Current Roles Count: ${count}`);

        if (count === 0) {
            console.log('🌱 Seeding Roles...');
            await Role.bulkCreate([
                { id: 1, name: 'Admin', description: 'Administrator' },
                { id: 2, name: 'Moderator', description: 'Moderator' },
                { id: 5, name: 'User', description: 'Regular User' } // specific ID as per User.js default
            ]);
            console.log('✅ Roles Seeded!');
        } else {
            const userRole = await Role.findOne({ where: { name: 'User' } });
            if (!userRole) {
                console.log('⚠️ User role missing! Creating it...');
                await Role.create({ id: 5, name: 'User', description: 'Regular User' });
                console.log('✅ User role created.');
            } else {
                console.log('✅ User role exists.');
            }
        }

    } catch (error) {
        console.error('❌ Error checking roles:', error);
    } finally {
        await sequelize.close();
    }
}

checkAndSeedRoles();
