import { Response } from 'express';
import prisma from '../db';
import { AuthedRequest } from '../middleware/auth';

type OutOfStockDetail = { itemId: string; requested: number; available: number };

export const checkout = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Load cart with item details
    const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { item: true } });
    if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

    // Prepare requested quantities
    const requested = cartItems.map((ci) => ({ itemId: ci.itemId, quantity: ci.quantity, price: ci.item.price }));

    // Run transactional stock check & deduction
    const outOfStock: OutOfStockDetail[] = [];

    const result = await prisma.$transaction(async (tx) => {
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
  } catch (err: any) {
    if (err && err.code === 'OUT_OF_STOCK') {
      return res.status(409).json({ error: 'OUT_OF_STOCK', details: err.details });
    }
    return res.status(500).json({ error: 'Server error', details: err?.message || err });
  }
};
