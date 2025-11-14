# Predis - Project Overview

## Vision
Predis is a social prediction and betting app where friends can create predictions about real-life events, bet virtual coins, and see who has the best intuition. It's designed to be fun, engaging, and foster social interaction around everyday life events.

## Core Concept
Users can:
- Create predictions about real events (e.g., "Will Amy and James get together?", "Will Amber miss her plane?")
- Set an end date for when the prediction will be resolved
- Share predictions on a social timeline visible to friends
- Bet virtual coins (in-app currency only) on outcomes
- Earn coins based on correct predictions
- See dynamic odds calculated based on betting patterns

## Key Features

### 1. Prediction Creation
- User creates a prediction with a question
- Defines possible outcomes (typically Yes/No, but can support multiple options)
- Sets an end date for resolution
- Optionally adds context, tags, or participants

### 2. Social Timeline
- Chronological feed of active predictions
- Shows predictions from friends and public predictions
- Displays current odds, time remaining, and betting activity
- Filter by categories, friends, or trending predictions

### 3. Betting System
- Users start with an initial coin balance
- Bet coins on any active prediction
- Real-time odds calculation based on total coins bet on each outcome
- Odds formula: `payout_multiplier = total_pool / coins_on_outcome`
- Cannot withdraw or purchase coins (keeps it fun, not gambling)

### 4. Resolution & Payouts
- Creator receives notification when prediction end date arrives
- Creator marks the correct outcome
- System automatically distributes coins to winners
- Winners receive: `bet_amount * payout_multiplier`
- Losers lose their bet amount
- Creator can earn a small fee or bonus for creating engaging predictions

### 5. User Profiles
- Display username, avatar, coin balance
- Show prediction history (created, won, lost)
- Statistics: win rate, total coins earned, best predictions
- Friend list and social connections

### 6. Notifications
- New predictions from friends
- Reminders for ending predictions (for creators)
- Win/loss notifications
- Friend activity updates

## Target Platforms
- **iOS** (iPhone and iPad)
- **Android** (phones and tablets)
- **Web** (for debugging and potential desktop access)

## User Flow Example

```
1. User opens app → sees timeline of active predictions
2. User taps "+ New Prediction"
3. Enters question: "Will it rain tomorrow?"
4. Sets end date: Tomorrow 6 PM
5. Prediction appears on timeline
6. Friends see it, bet coins (300 on Yes, 700 on No)
7. Odds: Yes pays 3.33x, No pays 1.43x
8. Tomorrow at 6 PM, creator gets reminder
9. Creator marks "Yes" as correct (it rained)
10. Winners who bet on "Yes" receive their payout
11. Losers lose their bet, coins redistributed
```

## Monetization Strategy (Future)
- Keep the app free and fun (no real money)
- Potential cosmetic purchases (avatars, themes)
- Optional "boosts" to highlight predictions
- Premium features (analytics, private groups)

## Success Metrics
- Daily active users
- Predictions created per day
- Betting engagement rate
- User retention (7-day, 30-day)
- Average session time
- Friend connections per user

## Design Principles
1. **Simple & Intuitive**: Easy to create and bet on predictions
2. **Social First**: Emphasize friend interactions and community
3. **Fast & Responsive**: Quick loading, real-time updates
4. **Engaging**: Gamification elements, streaks, achievements
5. **Safe & Fun**: No real money, no toxic behavior

## Out of Scope (Initial Version)
- Real money transactions
- Complex prediction markets (focus on simple binary/multiple choice)
- Video/image betting (stick to text initially)
- Direct messaging (can be added later)
- Advanced analytics dashboard (keep it simple first)

## Privacy & Safety
- Users can control prediction visibility (friends-only vs public)
- Reporting system for inappropriate content
- Age-appropriate content guidelines
- No personal data selling
- Optional anonymous mode for sensitive predictions
