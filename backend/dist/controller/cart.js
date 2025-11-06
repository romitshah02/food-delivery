"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const db_1 = __importDefault(require("../db"));
// Get current user's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await db_1.default.cartItem.findMany({
            where: { userId },
            include: { item: true },
        });
        const cart = items.map((ci) => ({
            id: ci.id,
            itemId: ci.itemId,
            name: ci.item.name,
            price: ci.item.price,
            quantity: ci.quantity,
            availableStock: ci.item.stock,
        }));
        const subtotal = cart.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
        return res.json({ cart, subtotal });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getCart = getCart;
// Add item to cart (or increment if exists)
const addItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, quantity } = req.body;
        const qty = Number(quantity) || 1;
        if (!itemId || qty <= 0)
            return res.status(400).json({ error: 'itemId and positive quantity required' });
        const item = await db_1.default.item.findUnique({ where: { id: itemId } });
        if (!item)
            return res.status(404).json({ error: 'Item not found' });
        // upsert cart item by userId+itemId
        const existing = await db_1.default.cartItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
        if (existing) {
            const updated = await db_1.default.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } });
            return res.json(updated);
        }
        const created = await db_1.default.cartItem.create({ data: { userId, itemId, quantity: qty } });
        return res.status(201).json(created);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.addItem = addItem;
// Update cart item quantity
const updateItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.id;
        const { quantity } = req.body;
        const qty = Number(quantity);
        if (isNaN(qty) || qty < 0)
            return res.status(400).json({ error: 'quantity must be a non-negative number' });
        const cartItem = await db_1.default.cartItem.findUnique({ where: { id: cartItemId } });
        if (!cartItem || cartItem.userId !== userId)
            return res.status(404).json({ error: 'Cart item not found' });
        if (qty === 0) {
            await db_1.default.cartItem.delete({ where: { id: cartItemId } });
            return res.json({ ok: true });
        }
        const updated = await db_1.default.cartItem.update({ where: { id: cartItemId }, data: { quantity: qty } });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.updateItem = updateItem;
// Remove cart item
const removeItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.id;
        const cartItem = await db_1.default.cartItem.findUnique({ where: { id: cartItemId } });
        if (!cartItem || cartItem.userId !== userId)
            return res.status(404).json({ error: 'Cart item not found' });
        await db_1.default.cartItem.delete({ where: { id: cartItemId } });
        return res.json({ ok: true });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.removeItem = removeItem;
// Merge client-side cart into server cart
const mergeCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        for (const it of items) {
            const itemId = it.itemId;
            const qty = Number(it.quantity) || 0;
            if (!itemId || qty <= 0)
                continue;
            const existing = await db_1.default.cartItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
            if (existing) {
                await db_1.default.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } });
            }
            else {
                await db_1.default.cartItem.create({ data: { userId, itemId, quantity: qty } });
            }
        }
        const updated = await db_1.default.cartItem.findMany({ where: { userId }, include: { item: true } });
        return res.json({ items: updated });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.mergeCart = mergeCart;
//# sourceMappingURL=cart.js.map