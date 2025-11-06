"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const JWT_SECRET = process.env.JWT_SECRET || 'KEY_ERROR_USING_DEFAULT';
async function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer '))
            return res.status(401).json({ error: 'Missing Authorization' });
        const token = auth.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!payload || !payload.sub)
            return res.status(401).json({ error: 'Invalid token' });
        const user = await db_1.default.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            return res.status(401).json({ error: 'User not found' });
        req.user = { id: user.id, email: user.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized', details: err.message });
    }
}
function generateAccessToken(userId) {
    // short-lived access token
    return jsonwebtoken_1.default.sign({ sub: userId }, JWT_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken() {
    // refresh tokens are stored hashed in DB; return plaintext to client
    return jsonwebtoken_1.default.sign({ t: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
}
//# sourceMappingURL=auth.js.map