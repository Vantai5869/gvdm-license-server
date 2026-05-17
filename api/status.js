const redis = require('./_redis');
const { cors } = require('./_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).end();

    const mode = await redis.get('config:mode') || 'allow_all';
    return res.status(200).json({ mode });
};
