const { checkAuth, cors } = require('../_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!await checkAuth(req)) return res.status(401).json({ error: 'Sai mật khẩu' });

    const redis = require('../_redis');
    if (!redis) {
        return res.status(500).json({
            error: 'Redis chưa được cấu hình',
            hint: 'Kiểm tra env vars: UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN trong Vercel Settings',
            available: Object.keys(process.env).filter(k => k.includes('REDIS') || k.includes('KV') || k.includes('UPSTASH')),
        });
    }

    if (req.method === 'GET') {
        const mode = await redis.get('config:mode') || 'allow_all';
        return res.status(200).json({ mode });
    }

    if (req.method === 'PUT') {
        const { mode } = req.body || {};
        if (!['allow_all', 'code_required'].includes(mode)) {
            return res.status(400).json({ error: 'Chế độ không hợp lệ' });
        }
        await redis.set('config:mode', mode);
        return res.status(200).json({ mode });
    }

    return res.status(405).end();
};
