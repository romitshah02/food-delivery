import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getOrderHistory, getOrderDetails, updateOrderStatus } from '../controller/orders';

const router = Router();

// Protect all order routes
router.use(requireAuth);

// Order routes
router.get('/', getOrderHistory);
router.get('/:id', getOrderDetails);
router.patch('/:id/status', updateOrderStatus);

export default router;