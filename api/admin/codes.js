const { kv } = require('@vercel/kv');
const { checkAuth, cors } = require('../_auth');

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `GVDM-${seg()}-${seg()}`;
}

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!checkAuth(req)) return res.status(401).json({ error: 'Sai mật khẩu' });

    if (req.method === 'GET') {
        const index = await kv.get('codes:index') || [];
        const codes = await Promise.all(
            index.map(async (code) => {
                const data = await kv.get(`code:${code}`);
                return { code, ...(data || {}) };
            })
        );
        return res.status(200).json({ codes });
    }

    if (req.method === 'POST') {
        const { note } = req.body || {};
        const code = generateCode();
        const data = {
            note: (note || '').trim(),
            createdAt: new Date().toISOString(),
            active: true,
        };
        await kv.set(`code:${code}`, data);
        const index = await kv.get('codes:index') || [];
        index.unshift(code);
        await kv.set('codes:index', index);
        return res.status(200).json({ code, ...data });
    }

    if (req.method === 'DELETE') {
        const { code } = req.body || {};
        if (!code) return res.status(400).json({ error: 'Thiếu mã' });
        await kv.del(`code:${code}`);
        const index = (await kv.get('codes:index') || []).filter(c => c !== code);
        await kv.set('codes:index', index);
        return res.status(200).json({ success: true });
    }

    return res.status(405).end();
};
