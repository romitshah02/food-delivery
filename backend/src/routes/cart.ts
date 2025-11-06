import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getCart, addItem, updateItem, removeItem, mergeCart } from '../controller/cart';

const router = express.Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.post('/merge', mergeCart);

export default router;
