"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = void 0;
const db_1 = __importDefault(require("../db"));
const checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        // Load cart with item details
        const cartItems = await db_1.default.cartItem.findMany({ where: { userId }, include: { item: true } });
        if (!cartItems.length)
            return res.status(400).json({ error: 'Cart is empty' });
        // Prepare requested quantities
        const requested = cartItems.map((ci) => ({ itemId: ci.itemId, quantity: ci.quantity, price: ci.item.price }));
        // Run transactional stock check & deduction
        const outOfStock = [];
        const result = await db_1.default.$transaction(async (tx) => {
            // For each requested item, attempt to decrement stock only if available
            for (const r of requested) {
                const updated = await tx.item.updateMany({
                    where: { id: r.itemId, stock: { gte: r.quantity } },
                    data: { stock: { decrement: r.quantity } },
                });
                if (updated.count === 0) {
                    // fetch available stock for reporting
                    const itm = await tx.item.findUnique({ where: { id: r.itemId } });
                    outOfStock.push({ itemId: r.itemId, requested: r.quantity, available: itm ? itm.stock : 0 });
                }
            }
            if (outOfStock.length) {
                // any insufficient stock -> rollback by throwing
                throw { code: 'OUT_OF_STOCK', details: outOfStock };
            }
            // all good -> create order and order items
            const total = requested.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
            const order = await tx.order.create({
                data: {
                    userId,
                    totalPrice: total,
                    status: 'PENDING',
                    items: {
                        create: requested.map((it) => ({ itemId: it.itemId, quantity: it.quantity, priceAtPurchase: it.price })),
                    },
                },
            });
            // clear cart
            await tx.cartItem.deleteMany({ where: { userId } });
            return order;
        });
        return res.json({ success: true, orderId: result.id, trackingId: result.trackingId });
    }
    catch (err) {
        if (err && err.code === 'OUT_OF_STOCK') {
            return res.status(409).json({ error: 'OUT_OF_STOCK', details: err.details });
        }
        return res.status(500).json({ error: 'Server error', details: err?.message || err });
    }
};
exports.checkout = checkout;
//# sourceMappingURL=checkout.js.map