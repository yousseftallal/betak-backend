const { createClient } = require('redis');

let client;
let isConnected = false;

async function initRedis() {
  if (process.env.NODE_ENV === 'test') return;
  
  try {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        // Disable retry to fail fast on boot if Redis is down
        reconnectStrategy: false 
      }
    });

    client.on('error', (err) => {
        // console.error('Redis Client Error', err.message); 
    });

    client.on('connect', () => {
        isConnected = true;
        console.log('✅ Connected to Redis');
    });

    // Make connection optional
    await client.connect().catch(() => {
        console.warn('⚠️  Redis connection failed (optional). Caching disabled.');
        isConnected = false;
        // Don't kill process, just let it be
    });

  } catch (error) {
    console.warn('⚠️  Redis initialization failed:', error.message);
    isConnected = false;
  }
}

async function getCache(key) {
  if (!isConnected || !client) return null;
  try {
    return await client.get(key);
  } catch (err) {
    return null;
  }
}

async function setCache(key, value, ttl = 3600) {
  if (!isConnected || !client) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (err) {
    // ignore
  }
}

async function delCache(key) {
  if (!isConnected || !client) return;
  try {
    await client.del(key);
  } catch (err) {
    // ignore
  }
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache
};
