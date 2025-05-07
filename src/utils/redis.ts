// utils/redis.ts
import { createClient } from 'redis'

export const createRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL
  })
  
  client.on('error', err => console.error('Redis Client Error', err))
  
  try {
    await client.connect()
    return client
  } catch (err) {
    console.error('Redis connection failed:', err)
    throw err
  }
}
