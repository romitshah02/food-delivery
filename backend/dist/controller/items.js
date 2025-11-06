"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchItems = exports.getItemById = exports.getItemsByCategory = exports.getCategories = exports.getAllItems = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../db"));
// Get all items with optional filtering
const getAllItems = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 50));
        const search = req.query.search || '';
        const category = req.query.category;
        const where = {
            ...(category ? { category } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        };
        const [items, total] = await Promise.all([
            db_1.default.item.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            db_1.default.item.count({ where })
        ]);
        return res.json(items);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getAllItems = getAllItems;
// Get all available categories
const getCategories = async (_req, res) => {
    try {
        const categories = Object.values(client_1.ItemCategory);
        return res.json({ categories });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getCategories = getCategories;
// Get items by category with pagination
const getItemsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const search = req.query.search || '';
        const where = {
            category,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        };
        const [items, total] = await Promise.all([
            db_1.default.item.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            db_1.default.item.count({ where })
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
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getItemsByCategory = getItemsByCategory;
// Get item details by ID including real-time stock
const getItemById = async (req, res) => {
    try {
        const id = req.params.id;
        const item = await db_1.default.item.findUnique({
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
        if (!item)
            return res.status(404).json({ error: 'Item not found' });
        // Include popularity metrics
        return res.json({
            ...item,
            inCart: item._count.cartItems,
            timesPurchased: item._count.orderItems
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.getItemById = getItemById;
// Search items across categories
const searchItems = async (req, res) => {
    try {
        const search = req.query.q;
        if (!search)
            return res.status(400).json({ error: 'Search query required' });
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const where = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        };
        const [items, total] = await Promise.all([
            db_1.default.item.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [
                    { category: 'asc' },
                    { name: 'asc' }
                ]
            }),
            db_1.default.item.count({ where })
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
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
exports.searchItems = searchItems;
//# sourceMappingURL=items.js.map