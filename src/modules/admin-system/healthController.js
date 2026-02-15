const { sequelize } = require('../../database/models');
const os = require('os');

/**
 * Get System Health Stats
 * GET /api/v1/admin/health
 */
async function getSystemHealth(req, res) {
  try {
    const start = Date.now();
    
    // 1. Check Database Connection
    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      await sequelize.authenticate();
      dbLatency = Date.now() - start;
    } catch (error) {
      dbStatus = 'disconnected';
      console.error('DB Health Check Failed:', error);
    }

    // 2. System Stats
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // OS Stats
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = Math.round((usedMem / totalMem) * 100);

    const stats = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latency_ms: dbLatency,
          dialect: sequelize.getDialect()
        },
        redis: {
          status: 'unknown', // Placeholder until Redis is fully integrated
          latency_ms: 0
        }
      },
      system: {
        uptime_seconds: Math.floor(uptime),
        memory: {
          used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
          os_usage_percent: memUsagePercent
        },
        load_avg: os.loadavg() // [1min, 5min, 15min]
      }
    };

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Health Check Error:', error);
    return res.status(500).json({ 
      success: false, 
      status: 'error',
      error: { message: 'Health check failed' } 
    });
  }
}

module.exports = {
  getSystemHealth
};
