import express from 'express';
import { requireAuth } from '../middleware/auth';
import { checkout } from '../controller/checkout';

const router = express.Router();

router.post('/', requireAuth, checkout);

export default router;
