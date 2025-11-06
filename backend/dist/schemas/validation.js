"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersSchema = exports.updateOrderStatusSchema = exports.checkoutSchema = exports.updateCartItemSchema = exports.addToCartSchema = exports.getItemsByCategorySchema = exports.searchItemsSchema = exports.loginSchema = exports.registerSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Common schemas
exports.paginationSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
    })
});
// Auth schemas
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string()
    })
});
// Item schemas
exports.searchItemsSchema = exports.paginationSchema.extend({
    query: zod_1.z.object({
        q: zod_1.z.string().min(1),
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
    })
});
exports.getItemsByCategorySchema = exports.paginationSchema.extend({
    params: zod_1.z.object({
        category: zod_1.z.string()
    }),
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
    })
});
// Cart schemas
exports.addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        itemId: zod_1.z.string(),
        quantity: zod_1.z.number().int().positive()
    })
});
exports.updateCartItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string()
    }),
    body: zod_1.z.object({
        quantity: zod_1.z.number().int().min(0)
    })
});
// Order schemas
exports.checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        address: zod_1.z.string().min(5),
        paymentMethod: zod_1.z.enum(['CARD', 'CASH']),
        notes: zod_1.z.string().optional()
    })
});
exports.updateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string()
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.OrderStatus)
    })
});
exports.getOrdersSchema = exports.paginationSchema.extend({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
    })
});
//# sourceMappingURL=validation.js.map