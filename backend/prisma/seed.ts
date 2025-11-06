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

  const itemsData = [
    {
      name: 'Banana (1 dozen)',
      description: 'Fresh yellow bananas',
      price: 60.0,
  imageUrl: 'https://imgs.search.brave.com/EIp617gqbD2LzAmwLLEhIcRTA-0r9i9TCt_PV-9IFCA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by92/aWV3LWJhbmFuYS1m/cnVpdHNfMjMtMjE1/MDgyMzE0OS5qcGc_/c2VtdD1haXNfaW5j/b21pbmcmdz03NDAm/cT04MA',
      stock: 50,
      category: 'FRUIT',
    },
    {
      name: 'Apple (1 kg)',
      description: 'Red apples, premium',
      price: 180.0,
  imageUrl: 'https://imgs.search.brave.com/3fCea94vsGCoSfFMzwhz4pVjiRFkHX6mHexHhdSTqBo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjkv/MTc2LzA5MS9zbWFs/bC90aGUtdmlicmFu/dC1hcnJheS1vZi1m/cmVzaGx5LXBpY2tl/ZC1yZWQtYW5kLXll/bGxvdy1hcHBsZXMt/cGhvdG8uanBlZw',
      stock: 30,
      category: 'FRUIT',
    },
    {
      name: 'Tomato (1 kg)',
      description: 'Fresh tomatoes',
      price: 40.0,
  imageUrl: 'https://imgs.search.brave.com/5Vu93E0ML6NR_q76C2CpAu-Aq13_lduCXo1bXlgnY3U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2NpZW5jZWFsZXJ0/LmNvbS9pbWFnZXMv/MjAxOC0wNS9wcm9j/ZXNzZWQvR2V0dHlJ/bWFnZXMtNjUzMjcx/MzUwXzYwMC5qcGc',
      stock: 80,
      category: 'VEGETABLE',
    },
    {
      name: 'Chicken (1 kg)',
      description: 'Fresh chicken pieces',
      price: 220.0,
  imageUrl: 'https://imgs.search.brave.com/-BOj01KWME1xQ38PI_icKxf9OzMDM0323O7QJNw_lhI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vc2VsZmll/ZmFtaWx5LmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyMS8w/Ni9DaGlja2VuLUJv/bmVsZXNzLmpwZz9m/aXQ9MTAyNCwxMDI0/JnNzbD0x',
      stock: 20,
      category: 'NON_VEG',
    },
    {
      name: 'Whole Wheat Bread',
      description: 'Pack of 4 slices',
      price: 35.0,
  imageUrl: 'https://imgs.search.brave.com/6qIgVbvwWftXmk9TmSW9zSqMCCVZ3dbgCUEZd5u4tV4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNDkv/MDE4LzM2Ni9zbWFs/bC9jbG9zZS11cC1v/Zi1hLXNsaWNlLW9m/LXdob2xlLXdoZWF0/LWJyZWFkLXdpdGgt/d2hlYXQtc3RhbGtz/LWFuZC1ncmFpbnMt/b24tYS1ydXN0aWMt/YmFja2dyb3VuZC1m/cmVlLXBob3RvLmpw/ZWc',
      stock: 40,
      category: 'BREAD',
    },
    {
      name: 'Milk (1L)',
      description: 'Fresh milk',
      price: 45.0,
  imageUrl: 'https://imgs.search.brave.com/_0xkkLAyq9MEb_kpUjgUUCOyIfH-rgzYB7o3bVQL9Vs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9taWxr/LTE2NTc2OTIzLmpw/Zw',
      stock: 100,
      category: 'DAIRY',
    },
    {
      name: 'Potato (1 kg)',
      description: 'Good quality potatoes',
      price: 30.0,
  imageUrl: 'https://imgs.search.brave.com/5IlGvrAM52kb42Vu2b9v9gcd9LL6GdayypSt2ANGL1M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vY2RuLXBy/b2QubWVkaWNhbG5l/d3N0b2RheS5jb20v/Y29udGVudC9pbWFn/ZXMvYXJ0aWNsZXMv/MjgwLzI4MDU3OS9w/b3RhdG9lcy1jYW4t/YmUtaGVhbHRoZnVs/LmpwZz93PTExNTUm/aD0xNTQx',
      stock: 120,
      category: 'VEGETABLE',
    },
    {
      name: 'Maggi (2-min noodles)',
      description: 'Instant noodles (pack of 5)',
      price: 120.0,
  imageUrl: 'https://imgs.search.brave.com/cYvuKKZDEm49megODN7AxBpRb2DFrDZ9GOFN3TS7LbI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNDc1/NjE5NjY0L3Bob3Rv/L2FuLW9wZW4tcGFj/a2V0LW9mLW1hZ2dp/LTItbWludXRlLW5v/b2RsZXMtbWFudWZh/Y3R1cmVkLWJ5LW5l/c3RsZS1pbmRpYS1s/dGQtYXJlLWFycmFu/Z2VkLWZvci1hLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1m/NEljUWQ1eElEUF9s/NlFuWFU0TklDM0VB/NmQ4dmlNWjdkeVFM/MnVNUFFvPQ',
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
