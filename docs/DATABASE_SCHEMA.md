# Predis - Database Schema

## Overview

This document defines the complete PostgreSQL database schema using Prisma ORM. The schema is designed to support all core features while maintaining data integrity and performance.

## Core Principles

1. **ACID Transactions**: Critical for coin transfers and bet placements
2. **Referential Integrity**: Foreign keys ensure data consistency
3. **Soft Deletes**: Keep deleted records for audit trails
4. **Timestamps**: Track creation and modification times
5. **Indexes**: Optimize common queries

## Schema Diagram

```
Users
  ├─→ Predictions (creator)
  ├─→ Bets
  ├─→ Transactions
  ├─→ Friendships (both directions)
  └─→ Notifications

Predictions
  ├─→ PredictionOptions
  ├─→ Bets
  └─→ PredictionParticipants

Bets
  ├─→ User
  ├─→ Prediction
  ├─→ PredictionOption
  └─→ Transaction

Transactions
  ├─→ User
  └─→ related Bet/Prediction
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  displayName   String?
  avatar        String?   // URL to avatar image
  bio           String?   @db.Text
  
  // Gamification
  coinBalance   Int       @default(1000) // Starting balance
  level         Int       @default(1)
  experience    Int       @default(0)
  
  // Stats (denormalized for performance)
  totalPredictions  Int   @default(0)
  totalBets         Int   @default(0)
  totalWins         Int   @default(0)
  totalLosses       Int   @default(0)
  winRate           Float @default(0) // Calculated field
  
  // Preferences
  pushNotifications Boolean @default(true)
  emailNotifications Boolean @default(true)
  privateProfile    Boolean @default(false)
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  deletedAt     DateTime? // Soft delete
  
  // Relations
  predictions           Prediction[]
  bets                  Bet[]
  transactions          Transaction[]
  notificationsSent     Notification[] @relation("NotificationSender")
  notificationsReceived Notification[] @relation("NotificationReceiver")
  friendshipsInitiated  Friendship[] @relation("FriendshipInitiator")
  friendshipsReceived   Friendship[] @relation("FriendshipReceiver")
  participantIn         PredictionParticipant[]
  
  @@index([username])
  @@index([email])
  @@index([coinBalance])
  @@index([createdAt])
}

// ============================================
// PREDICTIONS
// ============================================

model Prediction {
  id              String   @id @default(cuid())
  creatorId       String
  creator         User     @relation(fields: [creatorId], references: [id])
  
  // Content
  question        String   @db.Text
  description     String?  @db.Text
  category        String?  // e.g., "Relationships", "Sports", "Weather"
  tags            String[] // Array of tags
  imageUrl        String?  // Optional image
  
  // Timing
  endDate         DateTime
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Status
  status          PredictionStatus @default(ACTIVE)
  correctOptionId String?          // Set when resolved
  
  // Visibility
  visibility      Visibility @default(FRIENDS)
  
  // Metadata
  totalPool       Int      @default(0) // Total coins bet
  totalBets       Int      @default(0) // Number of bets placed
  viewCount       Int      @default(0)
  
  // Creator reward
  creatorReward   Int      @default(0) // Coins earned by creator
  
  // Relations
  options         PredictionOption[]
  bets            Bet[]
  participants    PredictionParticipant[]
  
  @@index([creatorId])
  @@index([status])
  @@index([endDate])
  @@index([createdAt])
  @@index([visibility])
  @@index([category])
}

enum PredictionStatus {
  DRAFT       // Not yet published
  ACTIVE      // Open for betting
  LOCKED      // Past end date, awaiting resolution
  RESOLVED    // Outcome determined
  CANCELLED   // Cancelled by creator
  DISPUTED    // Under review
}

enum Visibility {
  PUBLIC      // Anyone can see
  FRIENDS     // Only friends
  PRIVATE     // Only invited participants
  UNLISTED    // Anyone with link
}

// ============================================
// PREDICTION OPTIONS
// ============================================

model PredictionOption {
  id           String     @id @default(cuid())
  predictionId String
  prediction   Prediction @relation(fields: [predictionId], references: [id], onDelete: Cascade)
  
  // Content
  text         String     // e.g., "Yes", "No", "Maybe"
  order        Int        // Display order (0, 1, 2...)
  
  // Betting stats
  totalBets    Int        @default(0) // Number of bets
  totalCoins   Int        @default(0) // Total coins on this option
  
  // Calculated odds (cached for performance)
  currentOdds  Float      @default(1.0)
  
  // Relations
  bets         Bet[]
  
  @@unique([predictionId, order])
  @@index([predictionId])
}

// ============================================
// PARTICIPANTS (for private predictions)
// ============================================

model PredictionParticipant {
  id           String     @id @default(cuid())
  predictionId String
  prediction   Prediction @relation(fields: [predictionId], references: [id], onDelete: Cascade)
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  
  invitedAt    DateTime   @default(now())
  role         ParticipantRole @default(BETTOR)
  
  @@unique([predictionId, userId])
  @@index([userId])
}

enum ParticipantRole {
  BETTOR      // Can bet
  VIEWER      // Can only view
  MODERATOR   // Can help resolve disputes
}

// ============================================
// BETS
// ============================================

model Bet {
  id         String     @id @default(cuid())
  userId     String
  user       User       @relation(fields: [userId], references: [id])
  
  predictionId String
  prediction   Prediction @relation(fields: [predictionId], references: [id], onDelete: Cascade)
  
  optionId   String
  option     PredictionOption @relation(fields: [optionId], references: [id])
  
  // Bet details
  amount     Int        // Coins bet
  oddsAtBet  Float      // Odds when bet was placed (for payout calculation)
  
  // Resolution
  status     BetStatus  @default(PENDING)
  payout     Int        @default(0) // Set when resolved (0 if lost)
  
  // Metadata
  placedAt   DateTime   @default(now())
  resolvedAt DateTime?
  
  // Relations
  transaction Transaction?
  
  @@index([userId])
  @@index([predictionId])
  @@index([status])
  @@index([placedAt])
}

enum BetStatus {
  PENDING   // Prediction still active
  WON       // User won
  LOST      // User lost
  REFUNDED  // Bet cancelled/refunded
}

// ============================================
// TRANSACTIONS (for audit trail)
// ============================================

model Transaction {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  
  type        TransactionType
  amount      Int             // Positive = credit, Negative = debit
  balanceBefore Int
  balanceAfter  Int
  
  // References
  betId       String?         @unique
  bet         Bet?            @relation(fields: [betId], references: [id])
  
  description String?
  metadata    Json?           // Additional data (e.g., prediction ID, reason)
  
  createdAt   DateTime        @default(now())
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

enum TransactionType {
  INITIAL_BALANCE   // Starting coins
  BET_PLACED        // Debit for bet
  BET_WON           // Credit from winning
  BET_REFUNDED      // Refund from cancelled bet
  DAILY_BONUS       // Daily login bonus
  ACHIEVEMENT       // Reward for achievement
  CREATOR_REWARD    // Reward for creating popular prediction
  ADMIN_ADJUSTMENT  // Manual adjustment
}

// ============================================
// FRIENDSHIPS
// ============================================

model Friendship {
  id          String   @id @default(cuid())
  
  initiatorId String
  initiator   User     @relation("FriendshipInitiator", fields: [initiatorId], references: [id])
  
  receiverId  String
  receiver    User     @relation("FriendshipReceiver", fields: [receiverId], references: [id])
  
  status      FriendshipStatus @default(PENDING)
  
  createdAt   DateTime @default(now())
  acceptedAt  DateTime?
  
  @@unique([initiatorId, receiverId])
  @@index([initiatorId])
  @@index([receiverId])
  @@index([status])
}

enum FriendshipStatus {
  PENDING   // Request sent, awaiting response
  ACCEPTED  // Friends
  BLOCKED   // Blocked by one party
  REJECTED  // Request rejected
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id         String   @id @default(cuid())
  
  recipientId String
  recipient   User    @relation("NotificationReceiver", fields: [recipientId], references: [id])
  
  senderId    String?
  sender      User?   @relation("NotificationSender", fields: [senderId], references: [id])
  
  type        NotificationType
  title       String
  message     String  @db.Text
  
  // Links
  actionUrl   String? // URL to navigate to
  imageUrl    String? // Optional image
  
  // Metadata
  read        Boolean @default(false)
  createdAt   DateTime @default(now())
  readAt      DateTime?
  
  // Additional data
  metadata    Json?   // Stores prediction ID, bet ID, etc.
  
  @@index([recipientId, read])
  @@index([createdAt])
}

enum NotificationType {
  PREDICTION_CREATED    // Friend created prediction
  PREDICTION_ENDING     // Prediction ending soon
  PREDICTION_ENDED      // Time to resolve
  PREDICTION_RESOLVED   // Outcome determined
  BET_WON               // You won!
  BET_LOST              // You lost
  FRIEND_REQUEST        // New friend request
  FRIEND_ACCEPTED       // Friend request accepted
  ACHIEVEMENT_UNLOCKED  // New achievement
  DAILY_BONUS           // Daily login bonus
  COMMENT_RECEIVED      // Someone commented (future feature)
  MENTION               // Someone mentioned you (future feature)
}

// ============================================
// ACHIEVEMENTS (future feature)
// ============================================

model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique // e.g., "first_prediction", "10_wins"
  name        String
  description String   @db.Text
  icon        String   // URL or emoji
  reward      Int      // Bonus coins
  
  // Unlock criteria
  criteria    Json     // Flexible criteria definition
  
  createdAt   DateTime @default(now())
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  
  unlockedAt    DateTime @default(now())
  
  @@unique([userId, achievementId])
  @@index([userId])
}
```

## Key Design Decisions

### 1. Soft Deletes
- `deletedAt` field on Users allows account recovery
- Preserves prediction history for data integrity

### 2. Denormalized Stats
- User stats (totalWins, winRate) stored for fast queries
- Updated via background jobs or triggers
- Trade-off: Slight data duplication for significant performance gain

### 3. Transaction Log
- Every coin movement tracked in `Transaction` table
- Provides audit trail and debugging capability
- Enables rollback and dispute resolution

### 4. Cached Odds
- `currentOdds` stored on `PredictionOption` for fast reads
- Updated on every bet placement
- Redis can cache active predictions for even faster access

### 5. JSONB Metadata
- `metadata` fields use PostgreSQL's JSONB for flexible data
- Useful for evolving features without schema changes
- Can be indexed for specific queries

## Indexes Explained

### High-Traffic Queries
```sql
-- Timeline: Recent predictions from friends
SELECT * FROM Prediction 
WHERE visibility = 'FRIENDS' AND status = 'ACTIVE'
ORDER BY createdAt DESC
LIMIT 20;
-- Indexes: status, createdAt, visibility

-- User's active bets
SELECT * FROM Bet 
WHERE userId = ? AND status = 'PENDING'
ORDER BY placedAt DESC;
-- Indexes: userId, status, placedAt

-- Leaderboard
SELECT * FROM User 
ORDER BY coinBalance DESC
LIMIT 100;
-- Index: coinBalance
```

### Composite Indexes (if needed)
```sql
-- For complex timeline filters
CREATE INDEX idx_predictions_timeline 
ON Prediction(status, visibility, endDate);

-- For user bet history
CREATE INDEX idx_bets_user_status 
ON Bet(userId, status, placedAt);
```

## Data Integrity Rules

### 1. Coin Balance Consistency
```typescript
// Always use transactions for coin operations
await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { coinBalance: { decrement: betAmount } }
  }),
  prisma.bet.create({
    data: { userId, predictionId, amount: betAmount, ... }
  }),
  prisma.transaction.create({
    data: { userId, type: 'BET_PLACED', amount: -betAmount, ... }
  })
]);
```

### 2. Prediction Resolution
```typescript
// Lock prediction before calculating payouts
await prisma.$transaction(async (tx) => {
  const prediction = await tx.prediction.update({
    where: { id: predictionId },
    data: { status: 'RESOLVED', correctOptionId }
  });
  
  const winningBets = await tx.bet.findMany({
    where: { predictionId, optionId: correctOptionId }
  });
  
  for (const bet of winningBets) {
    const payout = calculatePayout(bet);
    await tx.user.update({
      where: { id: bet.userId },
      data: { coinBalance: { increment: payout } }
    });
    await tx.bet.update({
      where: { id: bet.id },
      data: { status: 'WON', payout }
    });
  }
});
```

### 3. Constraints
- User cannot bet on same option multiple times (unique constraint or check in code)
- Bet amount must be positive and <= user balance
- Prediction endDate must be in future
- Creator cannot bet on their own prediction (optional rule)

## Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash: await bcrypt.hash('password123', 10),
      displayName: 'Alice Wonderland',
      coinBalance: 1000,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash: await bcrypt.hash('password123', 10),
      displayName: 'Bob Builder',
      coinBalance: 1000,
    },
  });

  // Create a prediction
  const prediction = await prisma.prediction.create({
    data: {
      creatorId: user1.id,
      question: 'Will it rain tomorrow?',
      description: 'Based on the weather forecast',
      category: 'Weather',
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      options: {
        create: [
          { text: 'Yes', order: 0 },
          { text: 'No', order: 1 },
        ],
      },
    },
    include: { options: true },
  });

  console.log('Seed data created:', { user1, user2, prediction });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Migrations

### Initial Migration
```bash
npx prisma migrate dev --name init
```

### Example Migration: Add Category Field
```bash
npx prisma migrate dev --name add_prediction_category
```

### Reset Database (Development)
```bash
npx prisma migrate reset
```

## Query Examples

### Get User with Stats
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    username: true,
    displayName: true,
    avatar: true,
    coinBalance: true,
    level: true,
    totalPredictions: true,
    totalBets: true,
    totalWins: true,
    winRate: true,
  },
});
```

### Get Timeline Feed
```typescript
const predictions = await prisma.prediction.findMany({
  where: {
    status: 'ACTIVE',
    OR: [
      { visibility: 'PUBLIC' },
      {
        visibility: 'FRIENDS',
        creator: {
          OR: [
            { friendshipsInitiated: { some: { receiverId: currentUserId, status: 'ACCEPTED' } } },
            { friendshipsReceived: { some: { initiatorId: currentUserId, status: 'ACCEPTED' } } },
          ],
        },
      },
    ],
  },
  include: {
    creator: { select: { username: true, avatar: true } },
    options: true,
    _count: { select: { bets: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

### Get User's Bet History
```typescript
const bets = await prisma.bet.findMany({
  where: { userId },
  include: {
    prediction: {
      select: { question: true, status: true, endDate: true },
    },
    option: { select: { text: true } },
  },
  orderBy: { placedAt: 'desc' },
  take: 50,
});
```

### Calculate Leaderboard
```typescript
const leaderboard = await prisma.user.findMany({
  where: { deletedAt: null },
  select: {
    id: true,
    username: true,
    displayName: true,
    avatar: true,
    coinBalance: true,
    totalWins: true,
    winRate: true,
  },
  orderBy: { coinBalance: 'desc' },
  take: 100,
});
```

## Performance Tips

### 1. Use Select Instead of Include
```typescript
// ❌ Slow: Fetches all fields
const user = await prisma.user.findUnique({ where: { id }, include: { bets: true } });

// ✅ Fast: Only fetch what you need
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, username: true, coinBalance: true },
});
```

### 2. Pagination with Cursor
```typescript
// ✅ Cursor-based pagination (better for large datasets)
const predictions = await prisma.prediction.findMany({
  take: 20,
  skip: 1, // Skip the cursor
  cursor: { id: lastPredictionId },
  orderBy: { createdAt: 'desc' },
});
```

### 3. Batch Queries
```typescript
// ✅ Use findMany instead of multiple findUnique
const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
});
```

### 4. Raw Queries for Complex Aggregations
```typescript
// For complex stats that Prisma struggles with
const topBettors = await prisma.$queryRaw`
  SELECT u.username, SUM(b.amount) as total_bet
  FROM "User" u
  JOIN "Bet" b ON b."userId" = u.id
  WHERE b."placedAt" > NOW() - INTERVAL '7 days'
  GROUP BY u.id
  ORDER BY total_bet DESC
  LIMIT 10
`;
```

## Backup & Recovery

### Automated Backups
- Use Neon/Supabase built-in backups (point-in-time recovery)
- Or set up pg_dump cronjob for self-hosted

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Future Schema Extensions

### Comments (Social Feature)
```prisma
model Comment {
  id            String   @id @default(cuid())
  predictionId  String
  userId        String
  content       String   @db.Text
  createdAt     DateTime @default(now())
  // ...
}
```

### Groups/Communities
```prisma
model Group {
  id          String   @id @default(cuid())
  name        String
  description String?
  // ...
}

model GroupMember {
  groupId String
  userId  String
  role    GroupRole
  // ...
}
```

### Reporting System
```prisma
model Report {
  id            String   @id @default(cuid())
  reporterId    String
  predictionId  String?
  userId        String?
  reason        String
  status        ReportStatus
  // ...
}
```
