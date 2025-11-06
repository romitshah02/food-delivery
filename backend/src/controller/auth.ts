import { Request, Response } from 'express';
import prisma from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'KEY_ERROR_USING_DEFAULT';

export const register = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'email and password required' });

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(409).json({ error: 'User already exists' });

		const hash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({ data: { email, password: hash } });

		return res.json({ user: { id: user.id, email: user.email } });
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: (err as Error).message });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'email and password required' });

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });

		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

		// create session with temporary tokenHash (we'll update it after generating token)
		const session = await prisma.session.create({ data: { userId: user.id, tokenHash: '', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), deviceInfo: req.headers['user-agent'] as string || 'unknown' } });

		// create refresh token as: <sessionId>.<random>, store only hash in DB for revocation support
		const random = crypto.randomBytes(48).toString('hex');
		const refreshPlain = `${session.id}.${random}`;
		const refreshHash = await bcrypt.hash(refreshPlain, 10);
		await prisma.session.update({ where: { id: session.id }, data: { tokenHash: refreshHash } });

		const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '15m' });

		return res.json({ user: { id: user.id, email: user.email }, accessToken, refreshToken: refreshPlain });
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: (err as Error).message });
	}
};

export const refresh = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

			// refresh token format: <sessionId>.<random>
			const parts = (refreshToken || '').split('.');
			if (parts.length < 2) return res.status(401).json({ error: 'Invalid refresh token' });
			const sid = parts[0];
			const session = await prisma.session.findUnique({ where: { id: sid } });
		if (!session || session.revoked) return res.status(401).json({ error: 'Session invalid' });
		if (new Date() > session.expiresAt) return res.status(401).json({ error: 'Session expired' });
			// verify hash matches
			const ok = await bcrypt.compare(refreshToken, session.tokenHash || '');
		if (!ok) return res.status(401).json({ error: 'Invalid refresh token' });

		// issue new access token
		const accessToken = jwt.sign({ sub: session.userId }, JWT_SECRET, { expiresIn: '15m' });
		return res.json({ accessToken });
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: (err as Error).message });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });


				// logout by parsing refresh token (sessionId.random)
				const parts = (refreshToken || '').split('.');
				if (parts.length < 2) return res.status(200).json({ ok: true });
				const sid = parts[0];
				await prisma.session.updateMany({ where: { id: sid }, data: { revoked: true } });
				return res.json({ ok: true });
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: (err as Error).message });
	}
};

