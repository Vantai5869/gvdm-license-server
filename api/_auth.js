const ADMIN_USER    = 'admin';
const DEFAULT_PASS  = 'admin@123';

async function checkAuth(req) {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Basic ')) return false;
    const decoded = Buffer.from(auth.slice(6), 'base64').toString();
    const colon   = decoded.indexOf(':');
    if (colon === -1) return false;
    const user = decoded.slice(0, colon);
    const pass = decoded.slice(colon + 1);
    if (user !== ADMIN_USER) return false;

    // Ưu tiên mật khẩu đã đổi trong Redis, fallback về mặc định
    let expected = DEFAULT_PASS;
    try {
        const redis    = require('./_redis');
        const stored   = redis ? await redis.get('config:admin_pass') : null;
        if (stored) expected = stored;
    } catch (_) {}

    return pass === expected;
}

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { checkAuth, cors };
