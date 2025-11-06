import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// Common schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    ),
    name: z.string().min(2)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

// Item schemas
export const searchItemsSchema = paginationSchema.extend({
  query: z.object({
    q: z.string().min(1),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

export const getItemsByCategorySchema = paginationSchema.extend({
  params: z.object({
    category: z.string()
  }),
  query: z.object({
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

// Cart schemas
export const addToCartSchema = z.object({
  body: z.object({
    itemId: z.string(),
    quantity: z.number().int().positive()
  })
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    quantity: z.number().int().min(0)
  })
});

// Order schemas
export const checkoutSchema = z.object({
  body: z.object({
    address: z.string().min(5),
    paymentMethod: z.enum(['CARD', 'CASH']),
    notes: z.string().optional()
  })
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus)
  })
});

export const getOrdersSchema = paginationSchema.extend({
  query: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});