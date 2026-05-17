const redis = require('./_redis');
const { cors } = require('./_auth');

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { code, deviceId } = req.body || {};
    if (!code || typeof code !== 'string') {
        return res.status(200).json({ valid: false, error: 'Thiếu mã kích hoạt' });
    }

    const key = code.toUpperCase().trim();
    const data = await redis.get(`code:${key}`);
    if (!data || !data.active) {
        return res.status(200).json({ valid: false, error: 'Mã không hợp lệ hoặc đã bị thu hồi' });
    }

    // Nếu không gửi deviceId → cho qua (mode allow_all hoặc client cũ)
    if (!deviceId) {
        return res.status(200).json({ valid: true });
    }

    const deviceKey = `code:device:${key}`;
    const boundDevice = await redis.get(deviceKey);

    if (!boundDevice) {
        // Lần đầu kích hoạt → gắn máy này vào key
        await redis.set(deviceKey, { deviceId, boundAt: new Date().toISOString() });
        return res.status(200).json({ valid: true });
    }

    if (boundDevice.deviceId === deviceId) {
        return res.status(200).json({ valid: true });
    }

    // Máy khác đang dùng key này
    return res.status(200).json({ valid: false, error: 'Mã này đã được kích hoạt trên máy khác. Liên hệ admin để được hỗ trợ.' });
};
