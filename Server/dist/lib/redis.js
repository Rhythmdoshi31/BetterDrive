"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.initRedis = void 0;
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '17731'),
    }
});
exports.redisClient = client;
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
const initRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
    }
};
exports.initRedis = initRedis;
//# sourceMappingURL=redis.js.map