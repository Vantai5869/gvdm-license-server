const { kv } = require('@vercel/kv');
const { checkAuth, cors } = require('../_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!checkAuth(req)) return res.status(401).json({ error: 'Sai mật khẩu' });

    if (req.method === 'GET') {
        const mode = await kv.get('config:mode') || 'allow_all';
        return res.status(200).json({ mode });
    }

    if (req.method === 'PUT') {
        const { mode } = req.body || {};
        if (!['allow_all', 'code_required'].includes(mode)) {
            return res.status(400).json({ error: 'Chế độ không hợp lệ' });
        }
        await kv.set('config:mode', mode);
        return res.status(200).json({ mode });
    }

    return res.status(405).end();
};
