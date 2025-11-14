import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash: hashedPassword,
      displayName: 'Alice Wonderland',
      bio: 'Love making predictions about everything!',
      coinBalance: 1500,
      level: 2,
      experience: 150,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash: hashedPassword,
      displayName: 'Bob Builder',
      bio: 'Can we predict it? Yes we can!',
      coinBalance: 1200,
      level: 1,
      experience: 80,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      passwordHash: hashedPassword,
      displayName: 'Charlie Chaplin',
      bio: 'Silent but deadly at predictions',
      coinBalance: 900,
    },
  });

  console.log('✅ Created test users:', { alice, bob, charlie });

  // Create friendships
  await prisma.friendship.create({
    data: {
      initiatorId: alice.id,
      receiverId: bob.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  await prisma.friendship.create({
    data: {
      initiatorId: alice.id,
      receiverId: charlie.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  console.log('✅ Created friendships');

  // Create sample predictions
  const prediction1 = await prisma.prediction.create({
    data: {
      creatorId: alice.id,
      question: 'Will it rain tomorrow in Paris?',
      description: 'Based on the weather forecast showing 60% chance of rain',
      category: 'Weather',
      tags: ['weather', 'paris'],
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      options: {
        create: [
          { text: 'Yes', order: 0, currentOdds: 1.5 },
          { text: 'No', order: 1, currentOdds: 2.5 },
        ],
      },
    },
    include: { options: true },
  });

  const prediction2 = await prisma.prediction.create({
    data: {
      creatorId: bob.id,
      question: 'Will the next iPhone have USB-C?',
      description: 'EU regulations might force Apple to adopt USB-C',
      category: 'Technology',
      tags: ['apple', 'iphone', 'tech'],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      options: {
        create: [
          { text: 'Yes', order: 0, currentOdds: 1.2 },
          { text: 'No', order: 1, currentOdds: 4.0 },
        ],
      },
    },
    include: { options: true },
  });

  const prediction3 = await prisma.prediction.create({
    data: {
      creatorId: alice.id,
      question: 'Will Bob win the office pool tournament?',
      description: "Bob's been practicing, but Sarah is really good too",
      category: 'Sports',
      tags: ['office', 'pool'],
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      visibility: 'FRIENDS',
      status: 'ACTIVE',
      options: {
        create: [
          { text: 'Yes', order: 0, currentOdds: 2.0 },
          { text: 'No', order: 1, currentOdds: 2.0 },
        ],
      },
    },
    include: { options: true },
  });

  console.log('✅ Created sample predictions:', {
    prediction1: prediction1.question,
    prediction2: prediction2.question,
    prediction3: prediction3.question,
  });

  // Create sample bets
  const bet1 = await prisma.bet.create({
    data: {
      userId: bob.id,
      predictionId: prediction1.id,
      optionId: prediction1.options[0].id, // Yes
      amount: 100,
      oddsAtBet: 1.5,
      status: 'PENDING',
    },
  });

  // Update prediction totals
  await prisma.prediction.update({
    where: { id: prediction1.id },
    data: {
      totalPool: 100,
      totalBets: 1,
    },
  });

  await prisma.predictionOption.update({
    where: { id: prediction1.options[0].id },
    data: {
      totalCoins: 100,
      totalBets: 1,
      currentOdds: 1.0, // Recalculated
    },
  });

  // Update Bob's balance
  await prisma.user.update({
    where: { id: bob.id },
    data: {
      coinBalance: 1100,
      totalBets: 1,
    },
  });

  // Create transaction
  await prisma.transaction.create({
    data: {
      userId: bob.id,
      type: 'BET_PLACED',
      amount: -100,
      balanceBefore: 1200,
      balanceAfter: 1100,
      betId: bet1.id,
      description: 'Bet placed on "Will it rain tomorrow in Paris?"',
    },
  });

  console.log('✅ Created sample bet');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      recipientId: bob.id,
      senderId: alice.id,
      type: 'PREDICTION_CREATED',
      title: 'New prediction from Alice',
      message: 'Alice created a new prediction: "Will it rain tomorrow in Paris?"',
      actionUrl: `/predictions/${prediction1.id}`,
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: alice.id,
      senderId: bob.id,
      type: 'PREDICTION_CREATED',
      title: 'New prediction from Bob',
      message: 'Bob created a new prediction: "Will the next iPhone have USB-C?"',
      actionUrl: `/predictions/${prediction2.id}`,
    },
  });

  console.log('✅ Created sample notifications');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
