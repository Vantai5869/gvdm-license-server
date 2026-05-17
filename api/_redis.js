const { Redis } = require('@upstash/redis');

const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
    console.error('[redis] Missing env vars. Available:', Object.keys(process.env).filter(k => k.includes('REDIS') || k.includes('KV') || k.includes('UPSTASH')).join(', '));
}

const redis = url && token ? new Redis({ url, token }) : null;

module.exports = redis;
