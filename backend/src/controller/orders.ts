import { Response } from 'express';
import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../db';
import { AuthedRequest } from '../middleware/auth';

// Get paginated list of user's orders
export const getOrderHistory = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const status = req.query.status as OrderStatus | undefined;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status ? { status } : {})
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
      prisma.order.count({ where })
    ]);

    // Transform orders to include totals and item details
    const enrichedOrders = orders.map(order => {
      const subtotal = order.items.reduce((sum, item) => 
        sum + (item.item.price * item.quantity), 0
      );

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
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Get detailed information about a specific order
export const getOrderDetails = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
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
    const subtotal = order.items.reduce((sum, item) => 
      sum + (item.item.price * item.quantity), 0
    );

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
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Update order status (could be restricted to admin users in the future)
export const updateOrderStatus = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const orderId = req.params.id;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId // Ensure order belongs to requesting user
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
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
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};