const { kv } = require('@vercel/kv');
const { cors } = require('./_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { code } = req.body || {};
    if (!code || typeof code !== 'string') {
        return res.status(200).json({ valid: false, error: 'Thiếu mã kích hoạt' });
    }

    const data = await kv.get(`code:${code.toUpperCase().trim()}`);
    if (!data || !data.active) {
        return res.status(200).json({ valid: false });
    }

    return res.status(200).json({ valid: true });
};
