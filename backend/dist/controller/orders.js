"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderDetails = exports.getOrderHistory = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../db"));
// Get paginated list of user's orders
const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const status = req.query.status;
        const where = {
            userId,
            ...(status ? { status } : {})
        };
        const [orders, total] = await Promise.all([
            db_1.default.order.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            item: true
                        }
                    }
                }
            }),
            db_1.default.order.count({ where })
        ]);
        // Transform orders to include totals and item details
        const enrichedOrders = orders.map(order => {
            const subtotal = order.items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
            return {
                ...order,
                items: order.items.map(item => ({
                    id: item.id,
                    itemId: item.itemId,
                    name: item.item.name,
                    price: item.item.price,
                    quantity: item.quantity,
                    totalPrice: item.item.price * item.quantity
                })),
                subtotal,
                total: subtotal // Add tax/delivery calculation here if needed
            };
        });
        return res.json({
            orders: enrichedOrders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getOrderHistory = getOrderHistory;
// Get detailed information about a specific order
const getOrderDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const order = await db_1.default.order.findUnique({
            where: {
                id: orderId,
                userId // Ensure order belongs to requesting user
            },
            include: {
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Calculate order totals
        const subtotal = order.items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
        // Transform order data
        const enrichedOrder = {
            ...order,
            items: order.items.map(item => ({
                id: item.id,
                itemId: item.itemId,
                name: item.item.name,
                price: item.item.price,
                quantity: item.quantity,
                totalPrice: item.item.price * item.quantity
            })),
            subtotal,
            total: subtotal, // Add tax/delivery calculation here if needed
            statusHistory: [
                {
                    status: order.status,
                    timestamp: order.updatedAt
                }
            ]
        };
        return res.json(enrichedOrder);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getOrderDetails = getOrderDetails;
// Update order status (could be restricted to admin users in the future)
const updateOrderStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const { status } = req.body;
        if (!Object.values(client_1.OrderStatus).includes(status)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }
        const order = await db_1.default.order.findUnique({
            where: {
                id: orderId,
                userId // Ensure order belongs to requesting user
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Update order status
        const updatedOrder = await db_1.default.order.update({
            where: { id: orderId },
            data: {
                status,
                updatedAt: new Date() // Force update timestamp
            },
            include: {
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });
        return res.json(updatedOrder);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=orders.js.map