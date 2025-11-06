import { Request, Response } from 'express';
import { ItemCategory, Prisma } from '@prisma/client';
import prisma from '../db';

// Get all items with optional filtering
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = (req.query.search as string) || '';
    const category = req.query.category as ItemCategory | undefined;

    const where: Prisma.ItemWhereInput = {
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
        ]
      } : {})
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.item.count({ where })
    ]);

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Get all available categories
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = Object.values(ItemCategory);
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Get items by category with pagination
export const getItemsByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.params.category as ItemCategory;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';

    const where: Prisma.ItemWhereInput = {
      category,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
        ]
      } : {})
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.item.count({ where })
    ]);

    return res.json({
      items,
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

// Get item details by ID including real-time stock
export const getItemById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      }
    });

    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Include popularity metrics
    return res.json({
      ...item,
      inCart: item._count.cartItems,
      timesPurchased: item._count.orderItems
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
};

// Search items across categories
export const searchItems = async (req: Request, res: Response) => {
  try {
    const search = req.query.q as string;
    if (!search) return res.status(400).json({ error: 'Search query required' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const where: Prisma.ItemWhereInput = {
      OR: [
        { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
      ]
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.item.count({ where })
    ]);

    return res.json({
      items,
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