import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // Seed categories
  const categories = await Promise.all(
    ['Salary', 'Food', 'Rent', 'Transport', 'Entertainment', 'Other'].map((name) =>
      prisma.category.create({ data: { name } }),
    ),
  );
  console.log(`✅ Created ${categories.length} categories`);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // Seed a demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash: hashPassword('password123'),
    },
  });
  console.log(`✅ Created demo user: demo@example.com / password123`);

  // Seed transactions for the demo user
  const now = new Date();
  const transactions = [
    { amount: 5000, type: 'income', categoryId: categoryMap['Salary'], note: 'Monthly salary', daysAgo: 30 },
    { amount: 4800, type: 'income', categoryId: categoryMap['Salary'], note: 'Monthly salary', daysAgo: 0 },
    { amount: 1200, type: 'expense', categoryId: categoryMap['Rent'], note: 'Apartment rent', daysAgo: 28 },
    { amount: 1200, type: 'expense', categoryId: categoryMap['Rent'], note: 'Apartment rent', daysAgo: 2 },
    { amount: 45.5, type: 'expense', categoryId: categoryMap['Food'], note: 'Weekly groceries', daysAgo: 25 },
    { amount: 52.0, type: 'expense', categoryId: categoryMap['Food'], note: 'Weekly groceries', daysAgo: 18 },
    { amount: 38.75, type: 'expense', categoryId: categoryMap['Food'], note: 'Weekly groceries', daysAgo: 11 },
    { amount: 60.0, type: 'expense', categoryId: categoryMap['Food'], note: 'Restaurant dinner', daysAgo: 8 },
    { amount: 55.0, type: 'expense', categoryId: categoryMap['Transport'], note: 'Monthly bus pass', daysAgo: 27 },
    { amount: 25.0, type: 'expense', categoryId: categoryMap['Transport'], note: 'Taxi ride', daysAgo: 5 },
    { amount: 120.0, type: 'expense', categoryId: categoryMap['Entertainment'], note: 'Concert tickets', daysAgo: 15 },
    { amount: 15.99, type: 'expense', categoryId: categoryMap['Entertainment'], note: 'Streaming subscription', daysAgo: 20 },
    { amount: 200.0, type: 'income', categoryId: categoryMap['Other'], note: 'Freelance gig', daysAgo: 12 },
    { amount: 35.0, type: 'expense', categoryId: categoryMap['Other'], note: 'Office supplies', daysAgo: 7 },
    { amount: 89.99, type: 'expense', categoryId: categoryMap['Other'], note: 'New headphones', daysAgo: 3 },
  ];

  for (const t of transactions) {
    const date = new Date(now);
    date.setDate(date.getDate() - t.daysAgo);
    await prisma.transaction.create({
      data: {
        amount: t.amount,
        type: t.type,
        note: t.note,
        date,
        userId: demoUser.id,
        categoryId: t.categoryId,
      },
    });
  }
  console.log(`✅ Created ${transactions.length} transactions`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
