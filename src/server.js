require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { initRedis } = require('./config/redis');
const { sequelize } = require('./database/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('\n🚀 Starting Be-Tak Admin Dashboard...\n');
    console.log('='.repeat(50));

    // Test database connection
    console.log('\n📊 Connecting to PostgreSQL...');
    await testConnection();

    // Initialize Redis (optional, continues without it)
    console.log('\n🔴 Connecting to Redis...');
    await initRedis();

    // Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(50));
      console.log(`\n✅ Server running successfully!\n`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🎨 Admin Dashboard: http://localhost:${PORT}/admin`);
      console.log(`🔌 API Base: http://localhost:${PORT}/api/v1/admin`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
      console.log('='.repeat(50) + '\n');
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Started at: ${new Date().toLocaleString()}\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n⚠️  SIGTERM signal received. Closing server gracefully...');
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Server closed. Process terminating...');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Start the server
startServer();
