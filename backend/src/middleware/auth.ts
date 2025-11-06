import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'KEY_ERROR_USING_DEFAULT';

export interface AuthedRequest extends Request {
	user?: { id: string; email?: string };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
	try {
		const auth = req.headers.authorization;
		if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Authorization' });

		const token = auth.split(' ')[1];
		const payload = jwt.verify(token, JWT_SECRET) as any;
		if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid token' });

		const user = await prisma.user.findUnique({ where: { id: payload.sub } });
		if (!user) return res.status(401).json({ error: 'User not found' });

		req.user = { id: user.id, email: user.email };
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Unauthorized', details: (err as Error).message });
	}
}

export function generateAccessToken(userId: string) {
	// short-lived access token
	return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken() {
	// refresh tokens are stored hashed in DB; return plaintext to client
	return jwt.sign({ t: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
}

