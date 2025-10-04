import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const client: RedisClientType = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '17731'),
    }
});

// Error handling
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('ready', () => {
    console.log('✅ Redis Client Ready');
});

// Connection function
export const initRedis = async (): Promise<void> => {
    if (!client.isOpen) {
        await client.connect();
    }
};

// Export client
export { client as redisClient };
