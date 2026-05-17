const redis = require('../_redis');
const { checkAuth, cors } = require('../_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    if (!await checkAuth(req)) return res.status(401).json({ error: 'Sai mật khẩu hiện tại' });

    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    if (!redis) return res.status(500).json({ error: 'Redis chưa được cấu hình' });

    await redis.set('config:admin_pass', newPassword);
    return res.status(200).json({ success: true });
};
