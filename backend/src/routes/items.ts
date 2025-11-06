import { Router } from 'express';
import { getCategories, getAllItems, getItemsByCategory, getItemById, searchItems } from '../controller/items';

const router = Router();

// Public routes for browsing items
router.get('/', getAllItems);
router.get('/categories', getCategories);
router.get('/category/:category', getItemsByCategory);
router.get('/item/:id', getItemById);
router.get('/search', searchItems);

export default router;