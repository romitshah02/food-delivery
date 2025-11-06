"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'KEY_ERROR_USING_DEFAULT';
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'email and password required' });
        const existing = await db_1.default.user.findUnique({ where: { email } });
        if (existing)
            return res.status(409).json({ error: 'User already exists' });
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.default.user.create({ data: { email, password: hash } });
        return res.json({ user: { id: user.id, email: user.email } });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'email and password required' });
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcryptjs_1.default.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        // create session with temporary tokenHash (we'll update it after generating token)
        const session = await db_1.default.session.create({ data: { userId: user.id, tokenHash: '', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), deviceInfo: req.headers['user-agent'] || 'unknown' } });
        // create refresh token as: <sessionId>.<random>, store only hash in DB for revocation support
        const random = crypto_1.default.randomBytes(48).toString('hex');
        const refreshPlain = `${session.id}.${random}`;
        const refreshHash = await bcryptjs_1.default.hash(refreshPlain, 10);
        await db_1.default.session.update({ where: { id: session.id }, data: { tokenHash: refreshHash } });
        const accessToken = jsonwebtoken_1.default.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '15m' });
        return res.json({ user: { id: user.id, email: user.email }, accessToken, refreshToken: refreshPlain });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ error: 'refreshToken required' });
        // refresh token format: <sessionId>.<random>
        const parts = (refreshToken || '').split('.');
        if (parts.length < 2)
            return res.status(401).json({ error: 'Invalid refresh token' });
        const sid = parts[0];
        const session = await db_1.default.session.findUnique({ where: { id: sid } });
        if (!session || session.revoked)
            return res.status(401).json({ error: 'Session invalid' });
        if (new Date() > session.expiresAt)
            return res.status(401).json({ error: 'Session expired' });
        // verify hash matches
        const ok = await bcryptjs_1.default.compare(refreshToken, session.tokenHash || '');
        if (!ok)
            return res.status(401).json({ error: 'Invalid refresh token' });
        // issue new access token
        const accessToken = jsonwebtoken_1.default.sign({ sub: session.userId }, JWT_SECRET, { expiresIn: '15m' });
        return res.json({ accessToken });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ error: 'refreshToken required' });
        // logout by parsing refresh token (sessionId.random)
        const parts = (refreshToken || '').split('.');
        if (parts.length < 2)
            return res.status(200).json({ ok: true });
        const sid = parts[0];
        await db_1.default.session.updateMany({ where: { id: sid }, data: { revoked: true } });
        return res.json({ ok: true });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map