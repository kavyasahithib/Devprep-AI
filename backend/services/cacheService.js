const { createClient } = require('redis');
const crypto = require('crypto');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = createClient({ 
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 3) {
                console.warn('Redis connection failed after 3 attempts. AI Caching will be disabled.');
                return false; // Stop retrying
            }
            return 1000;
        }
    }
});

let isConnected = false;
let hasReportedError = false;

client.on('error', (err) => {
    if (!hasReportedError) {
        console.warn('Redis is unavailable. Proceeding without AI Caching.');
        hasReportedError = true;
    }
});

const connectRedis = async () => {
    try {
        if (!isConnected) {
            await client.connect();
            isConnected = true;
            console.log('Connected to Redis for AI Caching');
        }
    } catch (err) {
        // Error handled by client.on('error')
    }
};

// Auto-connect
connectRedis();

/**
 * Generate a unique hash for a prompt and code combination
 */
const generateKey = (prompt, code = "") => {
    return crypto.createHash('sha256').update(prompt + code).digest('hex');
};

/**
 * Get cached AI result
 */
exports.getCache = async (key) => {
    if (!isConnected) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis Get Error:', err);
        return null;
    }
};

/**
 * Set AI result in cache with TTL (1 day by default)
 */
exports.setCache = async (key, value, ttl = 86400) => {
    if (!isConnected) return;
    try {
        await client.set(key, JSON.stringify(value), {
            EX: ttl
        });
    } catch (err) {
        console.error('Redis Set Error:', err);
    }
};

exports.generateKey = generateKey;
exports.checkConnection = () => isConnected;
