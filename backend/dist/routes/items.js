"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const items_1 = require("../controller/items");
const router = (0, express_1.Router)();
// Public routes for browsing items
router.get('/', items_1.getAllItems);
router.get('/categories', items_1.getCategories);
router.get('/category/:category', items_1.getItemsByCategory);
router.get('/item/:id', items_1.getItemById);
router.get('/search', items_1.searchItems);
exports.default = router;
//# sourceMappingURL=items.js.map