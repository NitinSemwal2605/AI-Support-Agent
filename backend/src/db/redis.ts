import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
  if (isRedisConnected) {
    console.warn('⚠️ Redis connection error. Falling back to DB:', err.message);
  }
  isRedisConnected = false;
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
  isRedisConnected = true;
});

export const connectRedis = async () => {
  try {
    // Fail fast if Redis doesn't connect within 2 seconds
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2000))
    ]);
  } catch (error) {
    console.warn('⚠️ Could not establish initial Redis connection. Continuing without cache (Graceful Degradation).');
    isRedisConnected = false;
  }
};

export { redisClient, isRedisConnected };
