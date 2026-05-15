import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  redisClient.on('error', (err: Error) => {
    logger.error({ err }, 'Redis connection error');
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Named export for use in BullMQ (requires IORedis instance)
export const redis = getRedisClient();
