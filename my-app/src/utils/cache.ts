import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCachedRecommendation(userId: string) {
  try {
    return await redis.get(`recommendations:${userId}`);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedRecommendation(userId: string, recommendations: any[]) {
  try {
    await redis.setex(`recommendations:${userId}`, 3600, JSON.stringify(recommendations));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}