# Predis - Features & User Flows

## Feature Overview

This document details all features, user stories, and step-by-step flows for the Predis app. Use this as a reference when implementing specific features.

## User Roles

### Regular User
- Create predictions
- Bet on predictions
- View timeline
- Manage profile
- Connect with friends

### Creator (User who created a prediction)
- All Regular User abilities
- Resolve their own predictions
- Edit predictions (before any bets are placed)
- Cancel predictions (before end date)

### Admin (Future)
- Moderate content
- Resolve disputes
- Manage users
- View analytics

## Core Features

---

## 1. User Authentication

### 1.1 Sign Up Flow

**User Story**: As a new user, I want to create an account so I can start making predictions and betting.

**Steps**:
1. User opens app, sees landing page
2. User taps "Sign Up"
3. User enters:
   - Email address
   - Username (unique, 3-20 characters)
   - Password (min 8 characters)
   - Display name (optional)
4. System validates:
   - Email format and uniqueness
   - Username availability
   - Password strength
5. System creates account with 1000 starting coins
6. User receives welcome email (optional)
7. User is logged in and redirected to timeline

**Edge Cases**:
- Email already registered → Show error, suggest login
- Username taken → Suggest alternatives
- Weak password → Show requirements
- Network error → Show retry option

**Success Criteria**:
- Account created in database
- User logged in with session
- Initial coin balance set to 1000
- Welcome notification created

---

### 1.2 Login Flow

**User Story**: As a returning user, I want to log in to access my account.

**Steps**:
1. User opens app, sees landing page
2. User taps "Log In"
3. User enters email/username and password
4. System validates credentials
5. System creates session
6. User redirected to timeline
7. Last login timestamp updated

**Edge Cases**:
- Wrong password → Show error, offer reset
- Account doesn't exist → Suggest sign up
- Too many attempts → Rate limit, show CAPTCHA
- Remember me → Store refresh token

**Success Criteria**:
- User authenticated
- Session cookie set
- User data loaded
- Redirected to main app

---

### 1.3 Password Reset Flow

**User Story**: As a user who forgot my password, I want to reset it via email.

**Steps**:
1. User taps "Forgot Password"
2. User enters email
3. System sends reset link via email
4. User clicks link (valid for 1 hour)
5. User enters new password (2x for confirmation)
6. System updates password hash
7. User redirected to login

**Success Criteria**:
- Reset token generated and emailed
- Token expires after use or timeout
- Password successfully updated
- Old password no longer works

---

## 2. Timeline & Feed

### 2.1 View Timeline

**User Story**: As a user, I want to see a feed of active predictions from my friends and public predictions.

**Steps**:
1. User opens app (authenticated)
2. System loads timeline:
   - Active predictions from friends
   - Public predictions
   - Sorted by creation date (newest first)
   - Paginated (20 per page)
3. For each prediction, display:
   - Creator avatar and username
   - Prediction question
   - End date (countdown timer)
   - Current odds for each option
   - Total coins bet
   - Number of bets
   - User's bet (if any)
4. User can:
   - Scroll to load more
   - Pull to refresh
   - Filter by category
   - Search predictions

**Data Loading**:
```typescript
// Load timeline predictions
const predictions = await prisma.prediction.findMany({
  where: {
    status: 'ACTIVE',
    OR: [
      { visibility: 'PUBLIC' },
      {
        visibility: 'FRIENDS',
        creator: {
          // User is friends with creator
        }
      }
    ]
  },
  include: {
    creator: { select: { username, avatar } },
    options: true,
    bets: { where: { userId: currentUserId } }
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

**UI Components**:
- Timeline header with filters
- Prediction card (reusable component)
- Loading skeleton
- Empty state ("No predictions yet")
- Error state with retry

**Success Criteria**:
- Timeline loads within 2 seconds
- Infinite scroll works smoothly
- Real-time updates (via polling or WebSockets)
- Cached for offline viewing

---

### 2.2 Filter & Search Timeline

**User Story**: As a user, I want to filter predictions by category or search for specific topics.

**Steps**:
1. User taps filter icon
2. User selects filters:
   - Category (All, Relationships, Sports, Weather, etc.)
   - Time range (Ending soon, Ending today, This week)
   - Friends only vs All public
   - Trending (most bets in last 24h)
3. Timeline updates with filtered results
4. User can save favorite filters

**Search Flow**:
1. User taps search icon
2. User types query (debounced)
3. System searches prediction questions and descriptions
4. Results appear in real-time
5. User taps result to view details

**Success Criteria**:
- Filters applied without page reload
- Search results accurate and fast (<500ms)
- Filter state persists during session

---

## 3. Creating Predictions

### 3.1 Create Basic Prediction

**User Story**: As a user, I want to create a prediction about a future event.

**Steps**:
1. User taps "+" button (bottom nav or header)
2. User navigated to "Create Prediction" form
3. User fills in:
   - **Question** (required, 10-200 characters)
     - Example: "Will it rain tomorrow?"
   - **Description** (optional, up to 500 characters)
     - Context, details, rules
   - **End Date** (required, must be future)
     - Date picker + time picker
   - **Options** (default: Yes/No)
     - Can add up to 5 custom options
     - Each option 1-50 characters
   - **Category** (optional dropdown)
     - Relationships, Sports, Weather, Events, Other
   - **Visibility** (default: Friends)
     - Public, Friends, Private (invite only)
   - **Image** (optional, future feature)
4. User taps "Create Prediction"
5. System validates:
   - Question not empty
   - End date is future
   - At least 2 options
6. System creates prediction with status "ACTIVE"
7. Prediction appears on creator's timeline and friends' timelines
8. Creator receives confirmation
9. Notification sent to friends (if applicable)

**Validation Rules**:
```typescript
const predictionSchema = z.object({
  question: z.string().min(10).max(200),
  description: z.string().max(500).optional(),
  endDate: z.date().min(new Date()),
  options: z.array(z.string().min(1).max(50)).min(2).max(5),
  category: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE'])
});
```

**Success Criteria**:
- Prediction created in database
- Creator balance unchanged (free to create)
- Prediction visible to appropriate audience
- Creator can view and manage prediction

---

### 3.2 Edit Prediction (Before Bets)

**User Story**: As a creator, I want to edit my prediction if no one has bet yet.

**Steps**:
1. User views their prediction
2. If `totalBets === 0`:
   - "Edit" button visible
3. User taps "Edit"
4. User modifies question, description, or end date
5. User cannot change options (immutable)
6. User taps "Save"
7. System updates prediction
8. Timestamp `updatedAt` refreshed

**Restrictions**:
- Cannot edit if any bets placed
- Cannot change options (to prevent manipulation)
- Cannot change visibility if shared
- Must maintain future end date

**Success Criteria**:
- Prediction updated successfully
- No bets affected
- Edit history logged (optional)

---

### 3.3 Cancel Prediction

**User Story**: As a creator, I want to cancel my prediction if circumstances change.

**Steps**:
1. User views their prediction
2. User taps "Cancel Prediction"
3. System shows confirmation dialog
4. If user confirms:
   - Set status to "CANCELLED"
   - Refund all bets to users
   - Create refund transactions
   - Send notifications to all bettors
5. Prediction removed from active timeline
6. Prediction visible in creator's history as "Cancelled"

**Refund Logic**:
```typescript
await prisma.$transaction(async (tx) => {
  // Get all bets on this prediction
  const bets = await tx.bet.findMany({
    where: { predictionId }
  });
  
  // Refund each bet
  for (const bet of bets) {
    await tx.user.update({
      where: { id: bet.userId },
      data: { coinBalance: { increment: bet.amount } }
    });
    
    await tx.bet.update({
      where: { id: bet.id },
      data: { status: 'REFUNDED' }
    });
    
    await tx.transaction.create({
      data: {
        userId: bet.userId,
        type: 'BET_REFUNDED',
        amount: bet.amount,
        betId: bet.id
      }
    });
  }
  
  // Mark prediction as cancelled
  await tx.prediction.update({
    where: { id: predictionId },
    data: { status: 'CANCELLED' }
  });
});
```

**Success Criteria**:
- All bets refunded accurately
- Coin balances correct
- Notifications sent
- Prediction no longer active

---

## 4. Betting System

### 4.1 Place a Bet

**User Story**: As a user, I want to bet coins on a prediction outcome.

**Steps**:
1. User views prediction on timeline
2. User taps prediction card to view details
3. User sees:
   - Full question and description
   - Current odds for each option
   - Total pool size
   - Time remaining
   - Recent bets (optional)
4. User selects an option (e.g., "Yes")
5. User enters bet amount
   - Shows current balance
   - Slider or input field
   - Shows potential payout based on current odds
6. User taps "Place Bet"
7. System validates:
   - User has sufficient balance
   - Prediction still active
   - Amount > 0
8. System executes transaction:
   - Deduct coins from user balance
   - Create bet record
   - Update prediction total pool
   - Update option totals
   - Recalculate odds
   - Create transaction record
9. User sees confirmation
10. Timeline updates with new odds

**Odds Calculation**:
```typescript
// Formula: Payout multiplier = Total pool / Coins on this option
const totalPool = prediction.totalPool + betAmount;
const optionTotal = option.totalCoins + (selectedOption === option.id ? betAmount : 0);
const odds = totalPool / optionTotal;

// Payout if win = betAmount * odds
const potentialPayout = Math.floor(betAmount * odds);
```

**Transaction Example**:
```typescript
await prisma.$transaction(async (tx) => {
  // Deduct coins
  const user = await tx.user.update({
    where: { id: userId },
    data: { 
      coinBalance: { decrement: betAmount },
      totalBets: { increment: 1 }
    }
  });
  
  // Create bet
  const bet = await tx.bet.create({
    data: {
      userId,
      predictionId,
      optionId,
      amount: betAmount,
      oddsAtBet: currentOdds,
      status: 'PENDING'
    }
  });
  
  // Update prediction totals
  await tx.prediction.update({
    where: { id: predictionId },
    data: {
      totalPool: { increment: betAmount },
      totalBets: { increment: 1 }
    }
  });
  
  // Update option totals
  await tx.predictionOption.update({
    where: { id: optionId },
    data: {
      totalCoins: { increment: betAmount },
      totalBets: { increment: 1 }
    }
  });
  
  // Record transaction
  await tx.transaction.create({
    data: {
      userId,
      type: 'BET_PLACED',
      amount: -betAmount,
      betId: bet.id,
      balanceBefore: user.coinBalance + betAmount,
      balanceAfter: user.coinBalance
    }
  });
});
```

**Edge Cases**:
- Insufficient balance → Show error, suggest earning more coins
- Prediction ended → "Betting closed"
- Duplicate bet → Either allow or show existing bet
- Network error → Retry logic with idempotency

**Success Criteria**:
- Bet placed successfully
- Coins deducted correctly
- Odds updated in real-time
- User sees bet in their history
- Transaction logged

---

### 4.2 View Bet Details

**User Story**: As a user, I want to see details about my bet.

**Steps**:
1. User navigates to "My Bets" section
2. User sees list of all bets:
   - Active bets (pending predictions)
   - Won bets (with payout amount)
   - Lost bets
3. User taps a bet to see:
   - Prediction question
   - Option chosen
   - Amount bet
   - Odds at bet time
   - Current odds (if still active)
   - Potential payout
   - Status (pending/won/lost)
   - Date placed
4. User can navigate to prediction details

**Success Criteria**:
- All bets displayed accurately
- Correct calculation of potential payout
- Clear status indicators

---

## 5. Prediction Resolution

### 5.1 Resolve Prediction (Creator)

**User Story**: As a creator, I want to mark the correct outcome when my prediction ends.

**Steps**:
1. When end date passes:
   - Prediction status changes to "LOCKED"
   - Creator receives notification: "Time to resolve: [Question]"
2. Creator opens notification
3. Creator sees prediction with options
4. Creator selects correct outcome
5. System shows confirmation:
   - "Mark '[Option]' as correct?"
   - Shows impact: X winners, Y total payout
6. Creator confirms
7. System processes resolution:
   - Mark prediction as "RESOLVED"
   - Calculate payouts for winners
   - Update user balances
   - Update bet statuses
   - Create transaction records
   - Send notifications to all bettors
   - Award creator reward (optional bonus)
8. Creator sees resolution summary
9. Prediction archived in history

**Payout Calculation**:
```typescript
await prisma.$transaction(async (tx) => {
  // Mark as resolved
  await tx.prediction.update({
    where: { id: predictionId },
    data: { 
      status: 'RESOLVED',
      correctOptionId,
      resolvedAt: new Date()
    }
  });
  
  // Get all bets
  const allBets = await tx.bet.findMany({
    where: { predictionId },
    include: { user: true }
  });
  
  // Process winners
  const winningBets = allBets.filter(b => b.optionId === correctOptionId);
  const correctOption = await tx.predictionOption.findUnique({
    where: { id: correctOptionId }
  });
  
  const oddsForWinners = prediction.totalPool / correctOption.totalCoins;
  
  for (const bet of winningBets) {
    const payout = Math.floor(bet.amount * oddsForWinners);
    
    await tx.user.update({
      where: { id: bet.userId },
      data: { 
        coinBalance: { increment: payout },
        totalWins: { increment: 1 }
      }
    });
    
    await tx.bet.update({
      where: { id: bet.id },
      data: { 
        status: 'WON',
        payout,
        resolvedAt: new Date()
      }
    });
    
    await tx.transaction.create({
      data: {
        userId: bet.userId,
        type: 'BET_WON',
        amount: payout,
        betId: bet.id
      }
    });
    
    // Notify winner
    await tx.notification.create({
      data: {
        recipientId: bet.userId,
        type: 'BET_WON',
        title: 'You won!',
        message: `You won ${payout} coins on "${prediction.question}"`,
        actionUrl: `/predictions/${predictionId}`
      }
    });
  }
  
  // Process losers
  const losingBets = allBets.filter(b => b.optionId !== correctOptionId);
  for (const bet of losingBets) {
    await tx.user.update({
      where: { id: bet.userId },
      data: { totalLosses: { increment: 1 } }
    });
    
    await tx.bet.update({
      where: { id: bet.id },
      data: { 
        status: 'LOST',
        resolvedAt: new Date()
      }
    });
    
    // Notify loser
    await tx.notification.create({
      data: {
        recipientId: bet.userId,
        type: 'BET_LOST',
        title: 'Prediction resolved',
        message: `"${prediction.question}" was resolved. Better luck next time!`,
        actionUrl: `/predictions/${predictionId}`
      }
    });
  }
  
  // Optional: Award creator
  const creatorReward = Math.floor(prediction.totalPool * 0.05); // 5% fee
  await tx.user.update({
    where: { id: prediction.creatorId },
    data: { coinBalance: { increment: creatorReward } }
  });
});
```

**Edge Cases**:
- Creator doesn't resolve → Auto-resolve after 7 days or open to dispute
- No bets placed → Just mark as resolved, no payouts
- Disputed outcome → Flag for admin review

**Success Criteria**:
- All payouts calculated correctly
- No coins lost or created (conservation)
- All users notified
- Prediction marked as resolved
- Creator rewarded (if applicable)

---

### 5.2 Auto-Resolution Reminder

**User Story**: As a creator, I want to be reminded to resolve my prediction.

**Steps**:
1. Background job runs every hour
2. Checks for predictions where:
   - `endDate < now()`
   - `status === 'ACTIVE'`
3. For each:
   - Change status to 'LOCKED'
   - Create notification for creator
   - Send push notification (if enabled)
   - Send email (if enabled)
4. If creator doesn't resolve within 7 days:
   - Flag for manual review
   - Or auto-cancel with refunds

**Success Criteria**:
- Timely reminders sent
- No predictions stuck in limbo
- Grace period for creator to resolve

---

## 6. Social Features

### 6.1 Friend System

**User Story**: As a user, I want to connect with friends to see their predictions.

**Add Friend Flow**:
1. User searches for friend by username
2. User taps "Add Friend"
3. System creates friendship request (status: PENDING)
4. Friend receives notification
5. Friend taps notification
6. Friend sees request with accept/decline buttons
7. Friend accepts:
   - Status changes to ACCEPTED
   - Both users can now see each other's friend-only predictions
8. Both users notified

**View Friends**:
- List of all friends (accepted)
- Pending requests (sent)
- Pending requests (received)
- Option to unfriend or block

**Success Criteria**:
- Friend requests sent successfully
- Notifications work
- Friend-only predictions visible after acceptance

---

### 6.2 User Profile

**User Story**: As a user, I want to view my profile and statistics.

**Profile Page Shows**:
- Avatar, display name, username
- Bio (editable)
- Coin balance
- Level and experience
- Statistics:
  - Total predictions created
  - Total bets placed
  - Win/loss record
  - Win rate percentage
  - Total coins earned
  - Current streak (future)
- Recent activity:
  - Recent predictions
  - Recent bets
  - Recent wins
- Friends list

**Edit Profile**:
- Change avatar (upload image)
- Edit display name
- Edit bio
- Change email
- Change password
- Notification preferences

**Success Criteria**:
- Profile displays accurate data
- Statistics update in real-time
- Profile editable by owner only
- Public visibility respects privacy settings

---

### 6.3 Leaderboard

**User Story**: As a user, I want to see who has the most coins and best win rate.

**Leaderboard Tabs**:
1. **Top Coin Balance**
   - Users sorted by coinBalance DESC
   - Shows rank, avatar, username, coin count
2. **Best Win Rate**
   - Users with totalBets >= 10
   - Sorted by winRate DESC
3. **Most Predictions**
   - Sorted by totalPredictions DESC
4. **Friends Only**
   - Same metrics but filtered to friends

**Time Filters**:
- All time
- This month
- This week

**Success Criteria**:
- Leaderboard loads quickly (<1s)
- Updates daily or hourly
- Users can tap to view profiles

---

## 7. Notifications

### 7.1 Notification Types

**In-App Notifications**:
- Badge on bell icon
- List of unread notifications
- Tap to navigate to relevant page

**Push Notifications** (Mobile):
- System notifications via FCM
- User can enable/disable per type

**Email Notifications** (Optional):
- Daily digest of activity
- Important events (won bet, prediction ending)

**Notification Events**:
1. Friend created prediction
2. Friend bet on your prediction
3. Prediction ending in 1 hour
4. Prediction ended (reminder to resolve)
5. Bet won
6. Bet lost
7. Friend request received
8. Friend request accepted
9. Achievement unlocked
10. Daily login bonus

**Success Criteria**:
- Notifications delivered reliably
- User can customize preferences
- No spam (rate limiting)
- Clear and actionable messages

---

## 8. Gamification

### 8.1 Coins & Economy

**Earning Coins**:
- Initial balance: 1000 coins
- Win bets: Payout based on odds
- Daily login bonus: 50 coins
- Create popular prediction: 5% of total pool as creator fee
- Achievements: Varies by achievement
- Referral bonus: 100 coins (future)

**Spending Coins**:
- Place bets on predictions
- No other uses in MVP (keeps economy simple)

**Coin Conservation**:
- Total coins in system should balance
- Winning bets redistribute from losers
- Creator fees come from pool
- Daily bonuses are new coins (inflation controlled)

**Success Criteria**:
- Economy balanced (no runaway inflation)
- Users have enough coins to play
- Incentivizes daily engagement

---

### 8.2 Levels & Experience

**User Story**: As a user, I want to level up and show my expertise.

**XP Sources**:
- Create prediction: 10 XP
- Place bet: 5 XP
- Win bet: 20 XP
- Friend accepts request: 15 XP
- Daily login: 5 XP

**Level Formula**:
```typescript
// XP needed for level N: 100 * N^1.5
const xpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

// Check if user levels up
if (user.experience >= xpForLevel(user.level + 1)) {
  user.level += 1;
  // Award level-up bonus
  user.coinBalance += 100;
  // Send notification
}
```

**Success Criteria**:
- XP accumulates correctly
- Level-up triggers rewards
- Displayed prominently in profile

---

### 8.3 Achievements (Future Feature)

Examples:
- "First Prediction" - Create your first prediction
- "Lucky Guess" - Win your first bet
- "Hot Streak" - Win 5 bets in a row
- "High Roller" - Bet 500 coins on one prediction
- "Social Butterfly" - Have 10 friends
- "Trendsetter" - Create prediction with 100+ bets
- "Fortune Teller" - 80%+ win rate with 20+ bets

**Success Criteria**:
- Achievements unlock automatically
- User notified immediately
- Coin rewards granted
- Displayed on profile

---

## 9. Mobile-Specific Features

### 9.1 Push Notifications

**Setup**:
1. User installs app
2. App requests notification permission
3. User grants permission
4. FCM token registered
5. Token stored in user record

**Sending Push**:
```typescript
import admin from 'firebase-admin';

await admin.messaging().send({
  token: user.fcmToken,
  notification: {
    title: 'You won!',
    body: 'You won 250 coins on "Will it rain tomorrow?"',
    imageUrl: predictionImage
  },
  data: {
    type: 'BET_WON',
    predictionId: '123',
    actionUrl: '/predictions/123'
  }
});
```

---

### 9.2 Offline Support

**Caching Strategy**:
- Cache timeline for offline viewing
- Queue actions (bets, predictions) when offline
- Sync when connection restored

**Implementation**:
- Service Workers for web
- Capacitor Storage API for mobile
- React Query with persister

---

## 10. Admin Features (Future)

### 10.1 Content Moderation

- Review reported predictions
- Delete inappropriate content
- Ban users
- View audit logs

### 10.2 Analytics Dashboard

- Total users, DAU, MAU
- Predictions created per day
- Bets placed per day
- Coin distribution
- Most popular categories
- User retention cohorts

---

## Feature Priority Matrix

### MVP (Must Have)
✅ User authentication (signup, login)
✅ Create predictions (basic)
✅ View timeline
✅ Place bets
✅ Resolve predictions
✅ User profile
✅ Basic notifications

### Phase 2 (Should Have)
- Friend system
- Leaderboard
- Push notifications (mobile)
- Levels & XP
- Search & filters
- Edit profile

### Phase 3 (Nice to Have)
- Achievements
- Comments on predictions
- Share to social media
- Advanced statistics
- Groups/communities
- Dispute resolution

### Future
- Real-time updates (WebSockets)
- Video/image predictions
- Live predictions (sports, events)
- Private leagues
- Advanced analytics
- Premium features
