require('dotenv').config();
const { Sequelize } = require('sequelize');

// Support DATABASE_URL (Render, Railway, etc.) or individual env vars
let sequelize;

if (process.env.DATABASE_URL) {
  // Production: use connection string from hosting provider
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  // Development: use individual env vars
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 50,
        min: 10,
        acquire: 30000,
        idle: 10000
      },
      define: {
        underscored: true,
        freezeTableName: true,
        charset: 'utf8',
        dialectOptions: {
          collate: 'utf8_general_ci'
        }
      }
    }
  );
}

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

module.exports = sequelize;
module.exports.testConnection = testConnection;
