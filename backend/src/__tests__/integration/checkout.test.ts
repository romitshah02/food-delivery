import { authRequest, getAuthToken } from '../helpers';
import prisma from '../../db';
import { ItemCategory } from '@prisma/client';

describe('Checkout Flow', () => {
  let authToken: string;
  let userId: string;
  let itemId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await prisma.user.create({
      data: {
        email: 'checkout@test.com',
        password: '$2a$10$ZKMx4Q5qMHv.gYq1/lC3FeI0poWVS2pxN4AdnEh4zJDGcZhioLyha'
      }
    });
    userId = user.id;
    authToken = getAuthToken(user.id);

    // Create test item
    const item = await prisma.item.create({
      data: {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        stock: 5,
        category: ItemCategory.SNACK
      }
    });
    itemId = item.id;
  });

  beforeEach(async () => {
    // Clear cart and orders before each test
    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    await prisma.order.deleteMany({
      where: { userId }
    });
  });

  describe('Checkout Process', () => {
    it('should successfully complete a checkout with sufficient stock', async () => {
      // Add item to cart
      await authRequest(authToken)
        .post('/api/cart/items')
        .send({ itemId, quantity: 2 });

      // Perform checkout
      const res = await authRequest(authToken)
        .post('/api/checkout')
        .send({
          address: '123 Test St',
          paymentMethod: 'CARD'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('orderId');
      expect(res.body).toHaveProperty('status');

      // Verify order was created
      const order = await prisma.order.findUnique({
        where: { id: res.body.orderId },
        include: { items: true }
      });

      expect(order).toBeTruthy();
      expect(order?.items).toHaveLength(1);
      expect(order?.items[0].quantity).toBe(2);

      // Verify stock was reduced
      const updatedItem = await prisma.item.findUnique({
        where: { id: itemId }
      });
      expect(updatedItem?.stock).toBe(3);
    });

    it('should fail checkout with insufficient stock', async () => {
      // Add more items than available
      await authRequest(authToken)
        .post('/api/cart/items')
        .send({ itemId, quantity: 10 });

      // Attempt checkout
      const res = await authRequest(authToken)
        .post('/api/checkout')
        .send({
          address: '123 Test St',
          paymentMethod: 'CARD'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('insufficient stock');

      // Verify stock wasn't changed
      const item = await prisma.item.findUnique({
        where: { id: itemId }
      });
      expect(item?.stock).toBe(5);
    });
  });

  describe('Order Status Updates', () => {
    it('should successfully update order status', async () => {
      // Create an order first
      const order = await prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalPrice: 0
        }
      });

      // Update status
      const res = await authRequest(authToken)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('CONFIRMED');
    });
  });
});