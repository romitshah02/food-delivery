import express from 'express';
import { register, login, refresh, logout } from '../controller/auth';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/validation';
import { authLimiter } from '../middleware/security';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;

