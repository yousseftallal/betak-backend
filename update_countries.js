const { sequelize, User } = require('./src/database/models');

async function updateCountries() {
  try {
    console.log('Adding country column if not exists...');
    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);');
        console.log('Column ensuring complete.');
    } catch (e) {
        console.log('Column add error (might exist):', e.message);
    }

    const users = await User.findAll();
    const countries = ['Egypt', 'Saudi Arabia', 'UAE', 'USA', 'Germany', 'Unknown'];

    console.log(`Found ${users.length} users. Updating missing countries...`);

    for (const user of users) {
      if (!user.country) { // This might be null if we just added it
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        // Use raw query to update to avoid model sync issues or virtual field issues if restart needed
        await sequelize.query(`UPDATE users SET country = :country WHERE id = :id`, {
            replacements: { country: randomCountry, id: user.id }
        });
        console.log(`Updated user ${user.username} -> ${randomCountry}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateCountries();
