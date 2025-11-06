import { Response } from 'express';
import prisma from '../db';
import { AuthedRequest } from '../middleware/auth';

// Get current user's cart
export const getCart = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = await prisma.cartItem.findMany({
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
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Add item to cart (or increment if exists)
export const addItem = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId, quantity } = req.body;
    const qty = Number(quantity) || 1;
    if (!itemId || qty <= 0) return res.status(400).json({ error: 'itemId and positive quantity required' });

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // upsert cart item by userId+itemId
    const existing = await prisma.cartItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
    if (existing) {
      const updated = await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } });
      return res.json(updated);
    }

    const created = await prisma.cartItem.create({ data: { userId, itemId, quantity: qty } });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Update cart item quantity
export const updateItem = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) return res.status(400).json({ error: 'quantity must be a non-negative number' });

    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.userId !== userId) return res.status(404).json({ error: 'Cart item not found' });

    if (qty === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return res.json({ ok: true });
    }

    const updated = await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity: qty } });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Remove cart item
export const removeItem = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartItemId = req.params.id;
    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.userId !== userId) return res.status(404).json({ error: 'Cart item not found' });
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Merge client-side cart into server cart
export const mergeCart = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    for (const it of items) {
      const itemId = it.itemId;
      const qty = Number(it.quantity) || 0;
      if (!itemId || qty <= 0) continue;

      const existing = await prisma.cartItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } });
      } else {
        await prisma.cartItem.create({ data: { userId, itemId, quantity: qty } });
      }
    }

    const updated = await prisma.cartItem.findMany({ where: { userId }, include: { item: true } });
    return res.json({ items: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};
