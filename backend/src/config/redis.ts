import { createClient } from 'redis';
import env from './env';

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  try {
    const url = String(env.REDIS_URL || '').trim();

    const clientOptions: Parameters<typeof createClient>[0] = { url };

    // If a separate password is provided, pass it via socket options
    // This handles RedisLabs instances where the URL has no embedded password
    if (env.REDIS_PASSWORD) {
      clientOptions.password = env.REDIS_PASSWORD;
    }

    redisClient = createClient(clientOptions);

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis connected'));

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    throw error;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}
