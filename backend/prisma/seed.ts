import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data 
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.item.deleteMany();

  //  sample items
  const itemsData = [
    {
      name: 'Banana (1 dozen)',
      description: 'Fresh yellow bananas',
      price: 60.0,
      imageUrl: null,
      stock: 50,
      category: 'FRUIT',
    },
    {
      name: 'Apple (1 kg)',
      description: 'Red apples, premium',
      price: 180.0,
      imageUrl: null,
      stock: 30,
      category: 'FRUIT',
    },
    {
      name: 'Tomato (1 kg)',
      description: 'Fresh tomatoes',
      price: 40.0,
      imageUrl: null,
      stock: 80,
      category: 'VEGETABLE',
    },
    {
      name: 'Chicken (1 kg)',
      description: 'Fresh chicken pieces',
      price: 220.0,
      imageUrl: null,
      stock: 20,
      category: 'NON_VEG',
    },
    {
      name: 'Whole Wheat Bread',
      description: 'Pack of 4 slices',
      price: 35.0,
      imageUrl: null,
      stock: 40,
      category: 'BREAD',
    },
    {
      name: 'Milk (1L)',
      description: 'Fresh milk',
      price: 45.0,
      imageUrl: null,
      stock: 100,
      category: 'DAIRY',
    },
    {
      name: 'Potato (1 kg)',
      description: 'Good quality potatoes',
      price: 30.0,
      imageUrl: null,
      stock: 120,
      category: 'VEGETABLE',
    },
    {
      name: 'Maggi (2-min noodles)',
      description: 'Instant noodles (pack of 5)',
      price: 120.0,
      imageUrl: null,
      stock: 60,
      category: 'PANTRY',
    },
  ];

  const createdItems = [] as any[];
  for (const it of itemsData) {
    const created = await prisma.item.create({ data: it as any });
    createdItems.push(created);
  }

  // Create a test user
  const passwordPlain = 'Test1234!';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: passwordHash,
    },
  });

  // Create a session (refresh token) for the user
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const refreshHash = await bcrypt.hash(refreshToken, 10);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      deviceInfo: 'seed-script',
    },
  });

  // Add a couple of cart items for the user
  await prisma.cartItem.create({
    data: {
      userId: user.id,
      itemId: createdItems[0].id,
      quantity: 2,
    },
  });

  await prisma.cartItem.create({
    data: {
      userId: user.id,
      itemId: createdItems[2].id,
      quantity: 3,
    },
  });

  // Create a sample order (simulate a past order)
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      trackingId: `ORD-${Date.now()}`,
      totalPrice: 300.0,
      status: 'DELIVERED',
      items: {
        create: [
          {
            itemId: createdItems[1].id,
            quantity: 1,
            priceAtPurchase: createdItems[1].price,
          },
          {
            itemId: createdItems[4].id,
            quantity: 2,
            priceAtPurchase: createdItems[4].price,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log('Seeding completed.');
  console.log('Test user: email=test@example.com password=Test1234!');
  console.log('Refresh token (plaintext, copy and store if you want to use it):', refreshToken);
  console.log('Created items:', createdItems.map((i) => ({ id: i.id, name: i.name })));
  console.log('Sample order id:', order.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
