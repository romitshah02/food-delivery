"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const orders_1 = require("../controller/orders");
const router = (0, express_1.Router)();
// Protect all order routes
router.use(auth_1.requireAuth);
// Order routes
router.get('/', orders_1.getOrderHistory);
router.get('/:id', orders_1.getOrderDetails);
router.patch('/:id/status', orders_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map