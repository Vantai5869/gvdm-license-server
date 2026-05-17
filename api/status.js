const { kv } = require('@vercel/kv');
const { cors } = require('./_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).end();

    const mode = await kv.get('config:mode') || 'allow_all';
    return res.status(200).json({ mode });
};
