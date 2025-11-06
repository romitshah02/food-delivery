import { PrismaClient, ItemCategory } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Reset test database
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE');
  await prisma.$executeRawUnsafe('CREATE SCHEMA public');

  // Run migrations
  const prismaBinary = join(__dirname, '..', '..', 'node_modules', '.bin', 'prisma');
  execSync(`${prismaBinary} migrate deploy`, {
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL
    }
  });

  // Create test data
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: '$2a$10$ZKMx4Q5qMHv.gYq1/lC3FeI0poWVS2pxN4AdnEh4zJDGcZhioLyha' // 'password123'
    }
  });

  await prisma.item.createMany({
    data: [
      {
        name: 'Test Item 1',
        description: 'Description 1',
        price: 9.99,
        stock: 10,
        category: ItemCategory.SNACK
      },
      {
        name: 'Test Item 2',
        description: 'Description 2',
        price: 19.99,
        stock: 5,
        category: ItemCategory.BEVERAGE
      }
    ]
  });
});

// Clean up after each test
afterEach(async () => {
  const tables = ['CartItem', 'OrderItem', 'Order'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Make prisma available globally in tests
declare global {
  var prisma: PrismaClient;
}
global.prisma = prisma;