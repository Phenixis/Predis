# Predis - API Endpoints Reference

## Overview

This document provides a complete reference of all API endpoints in the Predis application. All endpoints are built using Next.js App Router API routes.

**Base URL**: `/api`

**Authentication**: Most endpoints require authentication via NextAuth.js session cookies.

**Content-Type**: `application/json` for all requests and responses.

---

## Response Format

### Success Response
```json
{
  "data": { /* Resource or array of resources */ },
  "meta": { /* Optional metadata like pagination */ }
}
```

### Error Response
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* Optional additional details */ }
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PATCH/DELETE
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (authenticated but insufficient permissions)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (e.g., duplicate bet)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Authentication

### POST `/api/auth/signup`
Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "alice",
  "password": "securePassword123",
  "displayName": "Alice Wonderland" // Optional
}
```

**Response** (`201 Created`):
```json
{
  "user": {
    "id": "cm1234567890",
    "email": "user@example.com",
    "username": "alice",
    "displayName": "Alice Wonderland",
    "coinBalance": 1000,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "session": {
    "token": "...",
    "expiresAt": "2025-01-02T00:00:00.000Z"
  }
}
```

**Errors**:
- `400` - Validation error (invalid email, weak password)
- `409` - Email or username already taken

---

### POST `/api/auth/login`
Log in to an existing account.

**Request Body**:
```json
{
  "email": "user@example.com", // Or username
  "password": "securePassword123"
}
```

**Response** (`200 OK`):
```json
{
  "user": {
    "id": "cm1234567890",
    "email": "user@example.com",
    "username": "alice",
    "displayName": "Alice Wonderland",
    "coinBalance": 1000,
    "avatar": "https://example.com/avatar.jpg"
  },
  "session": {
    "token": "...",
    "expiresAt": "2025-01-02T00:00:00.000Z"
  }
}
```

**Errors**:
- `401` - Invalid credentials
- `429` - Too many login attempts

---

### POST `/api/auth/logout`
Log out current user.

**Auth**: Required

**Response** (`200 OK`):
```json
{
  "message": "Logged out successfully"
}
```

---

### POST `/api/auth/forgot-password`
Request password reset email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (`200 OK`):
```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

---

### POST `/api/auth/reset-password`
Reset password with token.

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response** (`200 OK`):
```json
{
  "message": "Password reset successfully"
}
```

**Errors**:
- `400` - Invalid or expired token

---

## Users

### GET `/api/users/me`
Get current user profile.

**Auth**: Required

**Response** (`200 OK`):
```json
{
  "id": "cm1234567890",
  "email": "user@example.com",
  "username": "alice",
  "displayName": "Alice Wonderland",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Love making predictions!",
  "coinBalance": 1250,
  "level": 3,
  "experience": 450,
  "totalPredictions": 15,
  "totalBets": 42,
  "totalWins": 28,
  "totalLosses": 14,
  "winRate": 0.667,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "preferences": {
    "pushNotifications": true,
    "emailNotifications": false,
    "privateProfile": false
  }
}
```

---

### GET `/api/users/[username]`
Get user profile by username.

**Auth**: Required

**Parameters**:
- `username` (path) - Username to fetch

**Response** (`200 OK`):
```json
{
  "id": "cm1234567890",
  "username": "alice",
  "displayName": "Alice Wonderland",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Love making predictions!",
  "level": 3,
  "totalPredictions": 15,
  "totalBets": 42,
  "totalWins": 28,
  "winRate": 0.667,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "isFriend": true,
  "isPrivate": false
}
```

**Errors**:
- `404` - User not found

---

### PATCH `/api/users/me`
Update current user profile.

**Auth**: Required

**Request Body** (all fields optional):
```json
{
  "displayName": "Alice W.",
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg",
  "preferences": {
    "pushNotifications": false,
    "emailNotifications": true
  }
}
```

**Response** (`200 OK`):
```json
{
  "user": { /* Updated user object */ }
}
```

**Errors**:
- `400` - Validation error

---

### GET `/api/users/[username]/predictions`
Get predictions created by a user.

**Auth**: Required

**Parameters**:
- `username` (path)
- `status` (query) - Filter by status: `ACTIVE`, `RESOLVED`, `CANCELLED` (default: all)
- `limit` (query) - Number of results (default: 20, max: 100)
- `cursor` (query) - Cursor for pagination

**Response** (`200 OK`):
```json
{
  "predictions": [
    {
      "id": "pred123",
      "question": "Will it rain tomorrow?",
      "status": "ACTIVE",
      "endDate": "2025-01-02T18:00:00.000Z",
      "totalPool": 450,
      "totalBets": 12,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "options": [
        { "id": "opt1", "text": "Yes", "currentOdds": 2.5 },
        { "id": "opt2", "text": "No", "currentOdds": 1.8 }
      ]
    }
  ],
  "nextCursor": "pred456"
}
```

---

### GET `/api/users/[username]/bets`
Get bets placed by a user.

**Auth**: Required (own bets only, or if user allows)

**Parameters**:
- `username` (path)
- `status` (query) - Filter: `PENDING`, `WON`, `LOST` (default: all)
- `limit` (query) - Number of results (default: 20, max: 100)
- `cursor` (query) - Cursor for pagination

**Response** (`200 OK`):
```json
{
  "bets": [
    {
      "id": "bet123",
      "amount": 100,
      "status": "PENDING",
      "oddsAtBet": 2.5,
      "payout": 0,
      "placedAt": "2025-01-01T12:00:00.000Z",
      "prediction": {
        "id": "pred123",
        "question": "Will it rain tomorrow?",
        "endDate": "2025-01-02T18:00:00.000Z"
      },
      "option": {
        "id": "opt1",
        "text": "Yes"
      }
    }
  ],
  "nextCursor": "bet456"
}
```

**Errors**:
- `403` - Cannot view other users' bets (unless allowed)

---

### GET `/api/users/leaderboard`
Get leaderboard rankings.

**Auth**: Required

**Parameters**:
- `type` (query) - `coins`, `winRate`, `predictions` (default: `coins`)
- `period` (query) - `all`, `month`, `week` (default: `all`)
- `friends` (query) - `true` to filter by friends only (default: `false`)
- `limit` (query) - Number of results (default: 100, max: 500)

**Response** (`200 OK`):
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "username": "alice",
      "displayName": "Alice Wonderland",
      "avatar": "https://example.com/avatar.jpg",
      "value": 5000, // Depends on type (coins, winRate, etc.)
      "totalWins": 120,
      "totalBets": 180,
      "winRate": 0.667
    },
    // ... more users
  ],
  "currentUserRank": 42
}
```

---

## Predictions

### GET `/api/predictions`
Get timeline predictions (feed).

**Auth**: Required

**Parameters**:
- `visibility` (query) - `all`, `public`, `friends` (default: `all`)
- `status` (query) - `ACTIVE`, `RESOLVED` (default: `ACTIVE`)
- `category` (query) - Filter by category
- `search` (query) - Search query for question/description
- `sort` (query) - `recent`, `popular`, `ending-soon` (default: `recent`)
- `limit` (query) - Number of results (default: 20, max: 100)
- `cursor` (query) - Cursor for pagination

**Response** (`200 OK`):
```json
{
  "predictions": [
    {
      "id": "pred123",
      "creator": {
        "id": "user123",
        "username": "alice",
        "avatar": "https://example.com/avatar.jpg"
      },
      "question": "Will it rain tomorrow?",
      "description": "Based on weather forecast...",
      "category": "Weather",
      "visibility": "PUBLIC",
      "status": "ACTIVE",
      "endDate": "2025-01-02T18:00:00.000Z",
      "totalPool": 450,
      "totalBets": 12,
      "viewCount": 87,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "options": [
        {
          "id": "opt1",
          "text": "Yes",
          "order": 0,
          "totalBets": 8,
          "totalCoins": 300,
          "currentOdds": 1.5
        },
        {
          "id": "opt2",
          "text": "No",
          "order": 1,
          "totalBets": 4,
          "totalCoins": 150,
          "currentOdds": 3.0
        }
      ],
      "userBet": null // Or bet object if user has bet
    }
  ],
  "nextCursor": "pred456"
}
```

---

### GET `/api/predictions/[id]`
Get single prediction details.

**Auth**: Required

**Parameters**:
- `id` (path) - Prediction ID

**Response** (`200 OK`):
```json
{
  "id": "pred123",
  "creator": {
    "id": "user123",
    "username": "alice",
    "avatar": "https://example.com/avatar.jpg"
  },
  "question": "Will it rain tomorrow?",
  "description": "Based on weather forecast...",
  "category": "Weather",
  "tags": ["weather", "prediction"],
  "visibility": "PUBLIC",
  "status": "ACTIVE",
  "endDate": "2025-01-02T18:00:00.000Z",
  "resolvedAt": null,
  "correctOptionId": null,
  "totalPool": 450,
  "totalBets": 12,
  "viewCount": 87,
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z",
  "options": [
    {
      "id": "opt1",
      "text": "Yes",
      "order": 0,
      "totalBets": 8,
      "totalCoins": 300,
      "currentOdds": 1.5
    },
    {
      "id": "opt2",
      "text": "No",
      "order": 1,
      "totalBets": 4,
      "totalCoins": 150,
      "currentOdds": 3.0
    }
  ],
  "recentBets": [
    {
      "id": "bet789",
      "user": { "username": "bob", "avatar": "..." },
      "option": { "text": "Yes" },
      "amount": 50,
      "placedAt": "2025-01-01T14:00:00.000Z"
    }
  ],
  "userBet": {
    "id": "bet123",
    "optionId": "opt1",
    "amount": 100,
    "oddsAtBet": 2.5,
    "placedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

**Errors**:
- `404` - Prediction not found
- `403` - Not authorized to view (private prediction)

---

### POST `/api/predictions`
Create a new prediction.

**Auth**: Required

**Request Body**:
```json
{
  "question": "Will Amy and James get together?",
  "description": "They've been hanging out a lot lately...",
  "category": "Relationships",
  "tags": ["relationships", "friends"],
  "endDate": "2025-02-01T23:59:59.000Z",
  "options": ["Yes", "No"],
  "visibility": "FRIENDS"
}
```

**Response** (`201 Created`):
```json
{
  "prediction": {
    "id": "pred123",
    "question": "Will Amy and James get together?",
    "status": "ACTIVE",
    // ... full prediction object
  }
}
```

**Errors**:
- `400` - Validation error (invalid question, end date in past, etc.)
- `429` - Rate limit exceeded (max 10 predictions per hour)

---

### PATCH `/api/predictions/[id]`
Update prediction (only before any bets placed).

**Auth**: Required (creator only)

**Parameters**:
- `id` (path) - Prediction ID

**Request Body** (all fields optional):
```json
{
  "question": "Updated question?",
  "description": "Updated description",
  "endDate": "2025-02-02T23:59:59.000Z",
  "category": "Events"
}
```

**Response** (`200 OK`):
```json
{
  "prediction": { /* Updated prediction */ }
}
```

**Errors**:
- `403` - Not creator or bets already placed
- `400` - Validation error

---

### DELETE `/api/predictions/[id]`
Cancel prediction (refunds all bets).

**Auth**: Required (creator only)

**Parameters**:
- `id` (path) - Prediction ID

**Response** (`200 OK`):
```json
{
  "message": "Prediction cancelled successfully",
  "refunds": [
    { "userId": "user123", "amount": 100 },
    { "userId": "user456", "amount": 50 }
  ]
}
```

**Errors**:
- `403` - Not creator
- `400` - Prediction already resolved

---

### POST `/api/predictions/[id]/resolve`
Resolve prediction and distribute payouts.

**Auth**: Required (creator only)

**Parameters**:
- `id` (path) - Prediction ID

**Request Body**:
```json
{
  "correctOptionId": "opt1"
}
```

**Response** (`200 OK`):
```json
{
  "message": "Prediction resolved successfully",
  "resolution": {
    "predictionId": "pred123",
    "correctOptionId": "opt1",
    "resolvedAt": "2025-01-02T20:00:00.000Z",
    "totalWinners": 8,
    "totalLosers": 4,
    "totalPayout": 450,
    "creatorReward": 22
  },
  "payouts": [
    { "userId": "user123", "payout": 150 },
    { "userId": "user456", "payout": 75 }
  ]
}
```

**Errors**:
- `403` - Not creator
- `400` - Prediction not ended yet or already resolved
- `400` - Invalid option ID

---

### GET `/api/predictions/[id]/bets`
Get all bets on a prediction.

**Auth**: Required

**Parameters**:
- `id` (path) - Prediction ID
- `limit` (query) - Number of results (default: 20, max: 100)
- `cursor` (query) - Cursor for pagination

**Response** (`200 OK`):
```json
{
  "bets": [
    {
      "id": "bet123",
      "user": {
        "username": "bob",
        "avatar": "https://example.com/avatar.jpg"
      },
      "option": {
        "id": "opt1",
        "text": "Yes"
      },
      "amount": 100,
      "oddsAtBet": 2.5,
      "status": "PENDING",
      "placedAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "nextCursor": "bet456"
}
```

---

## Bets

### POST `/api/bets`
Place a bet on a prediction.

**Auth**: Required

**Request Body**:
```json
{
  "predictionId": "pred123",
  "optionId": "opt1",
  "amount": 100
}
```

**Response** (`201 Created`):
```json
{
  "bet": {
    "id": "bet123",
    "userId": "user123",
    "predictionId": "pred123",
    "optionId": "opt1",
    "amount": 100,
    "oddsAtBet": 2.5,
    "status": "PENDING",
    "payout": 0,
    "placedAt": "2025-01-01T12:00:00.000Z"
  },
  "userBalance": 900, // Updated balance
  "updatedOdds": [
    { "optionId": "opt1", "currentOdds": 2.3 },
    { "optionId": "opt2", "currentOdds": 3.2 }
  ]
}
```

**Errors**:
- `400` - Insufficient balance
- `400` - Invalid amount (negative, zero, or too large)
- `400` - Prediction ended or not active
- `404` - Prediction or option not found
- `409` - User already bet on this prediction (if not allowing multiple bets)

---

### GET `/api/bets/me`
Get current user's bets.

**Auth**: Required

**Parameters**:
- `status` (query) - `PENDING`, `WON`, `LOST`, `REFUNDED` (default: all)
- `limit` (query) - Number of results (default: 20, max: 100)
- `cursor` (query) - Cursor for pagination

**Response** (`200 OK`):
```json
{
  "bets": [
    {
      "id": "bet123",
      "amount": 100,
      "oddsAtBet": 2.5,
      "status": "PENDING",
      "payout": 0,
      "placedAt": "2025-01-01T12:00:00.000Z",
      "prediction": {
        "id": "pred123",
        "question": "Will it rain tomorrow?",
        "status": "ACTIVE",
        "endDate": "2025-01-02T18:00:00.000Z"
      },
      "option": {
        "id": "opt1",
        "text": "Yes",
        "currentOdds": 2.3
      },
      "potentialPayout": 250
    }
  ],
  "nextCursor": "bet456",
  "summary": {
    "totalPending": 5,
    "totalWon": 28,
    "totalLost": 14,
    "totalAmount": 3500,
    "totalPayout": 4200
  }
}
```

---

## Friends

### GET `/api/friends`
Get user's friends list.

**Auth**: Required

**Parameters**:
- `status` (query) - `ACCEPTED`, `PENDING`, `BLOCKED` (default: `ACCEPTED`)

**Response** (`200 OK`):
```json
{
  "friends": [
    {
      "id": "user456",
      "username": "bob",
      "displayName": "Bob Builder",
      "avatar": "https://example.com/avatar.jpg",
      "level": 5,
      "coinBalance": 2000,
      "friendshipStatus": "ACCEPTED",
      "friendsSince": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/friends`
Send friend request.

**Auth**: Required

**Request Body**:
```json
{
  "username": "bob"
}
```

**Response** (`201 Created`):
```json
{
  "friendship": {
    "id": "friend123",
    "initiatorId": "user123",
    "receiverId": "user456",
    "status": "PENDING",
    "createdAt": "2025-01-01T12:00:00.000Z"
  }
}
```

**Errors**:
- `404` - User not found
- `409` - Already friends or request pending
- `400` - Cannot add yourself

---

### PATCH `/api/friends/[id]`
Accept or reject friend request.

**Auth**: Required

**Parameters**:
- `id` (path) - Friendship ID

**Request Body**:
```json
{
  "action": "accept" // or "reject"
}
```

**Response** (`200 OK`):
```json
{
  "friendship": {
    "id": "friend123",
    "status": "ACCEPTED",
    "acceptedAt": "2025-01-01T12:30:00.000Z"
  }
}
```

**Errors**:
- `403` - Not the receiver of the request
- `404` - Friendship not found

---

### DELETE `/api/friends/[id]`
Remove friend or cancel request.

**Auth**: Required

**Parameters**:
- `id` (path) - Friendship ID

**Response** (`200 OK`):
```json
{
  "message": "Friendship removed successfully"
}
```

---

## Notifications

### GET `/api/notifications`
Get user's notifications.

**Auth**: Required

**Parameters**:
- `read` (query) - `true`, `false`, or omit for all
- `type` (query) - Filter by type (e.g., `BET_WON`, `PREDICTION_CREATED`)
- `limit` (query) - Number of results (default: 20, max: 100)
- `cursor` (query) - Cursor for pagination

**Response** (`200 OK`):
```json
{
  "notifications": [
    {
      "id": "notif123",
      "type": "BET_WON",
      "title": "You won!",
      "message": "You won 250 coins on \"Will it rain tomorrow?\"",
      "actionUrl": "/predictions/pred123",
      "imageUrl": null,
      "read": false,
      "createdAt": "2025-01-02T20:00:00.000Z",
      "sender": {
        "username": "alice",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  ],
  "nextCursor": "notif456",
  "unreadCount": 5
}
```

---

### PATCH `/api/notifications/[id]`
Mark notification as read.

**Auth**: Required

**Parameters**:
- `id` (path) - Notification ID

**Response** (`200 OK`):
```json
{
  "notification": {
    "id": "notif123",
    "read": true,
    "readAt": "2025-01-02T20:30:00.000Z"
  }
}
```

---

### POST `/api/notifications/mark-all-read`
Mark all notifications as read.

**Auth**: Required

**Response** (`200 OK`):
```json
{
  "message": "All notifications marked as read",
  "updatedCount": 5
}
```

---

## Search

### GET `/api/search`
Search across predictions and users.

**Auth**: Required

**Parameters**:
- `q` (query) - Search query (required)
- `type` (query) - `predictions`, `users`, `all` (default: `all`)
- `limit` (query) - Number of results per type (default: 10, max: 50)

**Response** (`200 OK`):
```json
{
  "predictions": [
    {
      "id": "pred123",
      "question": "Will it rain tomorrow?",
      "creator": { "username": "alice", "avatar": "..." },
      "totalBets": 12,
      "totalPool": 450,
      "status": "ACTIVE"
    }
  ],
  "users": [
    {
      "id": "user123",
      "username": "alice",
      "displayName": "Alice Wonderland",
      "avatar": "https://example.com/avatar.jpg",
      "level": 5
    }
  ]
}
```

---

## Statistics & Analytics

### GET `/api/stats/overview`
Get platform-wide statistics (public).

**Auth**: Optional

**Response** (`200 OK`):
```json
{
  "totalUsers": 10523,
  "totalPredictions": 4521,
  "activePredictions": 1234,
  "totalBets": 45678,
  "totalCoinsInCirculation": 10523000,
  "popularCategories": [
    { "category": "Sports", "count": 523 },
    { "category": "Weather", "count": 412 }
  ]
}
```

---

### GET `/api/stats/me`
Get personal statistics.

**Auth**: Required

**Response** (`200 OK`):
```json
{
  "userId": "user123",
  "coinBalance": 1250,
  "level": 3,
  "experience": 450,
  "predictions": {
    "total": 15,
    "active": 5,
    "resolved": 10,
    "avgBetsPerPrediction": 8.5
  },
  "bets": {
    "total": 42,
    "pending": 8,
    "won": 28,
    "lost": 14,
    "winRate": 0.667,
    "totalWagered": 3500,
    "totalEarned": 4200,
    "netProfit": 700,
    "bestWin": 500,
    "currentStreak": 3
  },
  "social": {
    "friends": 12,
    "followers": 8
  },
  "recentActivity": {
    "lastPredictionCreated": "2025-01-05T10:00:00.000Z",
    "lastBetPlaced": "2025-01-07T14:30:00.000Z",
    "lastLogin": "2025-01-08T09:00:00.000Z"
  }
}
```

---

## Rate Limits

Default rate limits (per user):

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/auth/login` | 5 requests | 15 minutes |
| `POST /api/auth/signup` | 3 requests | 1 hour |
| `POST /api/predictions` | 10 requests | 1 hour |
| `POST /api/bets` | 50 requests | 5 minutes |
| `GET /api/*` | 100 requests | 1 minute |
| `POST /api/*` | 30 requests | 1 minute |

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704110400
```

When rate limit exceeded:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Webhooks (Future Feature)

### POST `/api/webhooks/prediction-resolved`
Webhook for external integrations when predictions are resolved.

**Payload**:
```json
{
  "event": "prediction.resolved",
  "timestamp": "2025-01-02T20:00:00.000Z",
  "data": {
    "predictionId": "pred123",
    "question": "Will it rain tomorrow?",
    "correctOption": "Yes",
    "totalWinners": 8,
    "totalPayout": 450
  }
}
```

---

## Example API Usage

### Creating a Prediction and Betting

```typescript
// 1. Create a prediction
const createResponse = await fetch('/api/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Will it rain tomorrow?',
    endDate: '2025-01-02T18:00:00.000Z',
    options: ['Yes', 'No'],
    visibility: 'PUBLIC'
  })
});

const { prediction } = await createResponse.json();

// 2. Place a bet
const betResponse = await fetch('/api/bets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    predictionId: prediction.id,
    optionId: prediction.options[0].id, // Bet on "Yes"
    amount: 100
  })
});

const { bet, userBalance } = await betResponse.json();
console.log('Bet placed! New balance:', userBalance);

// 3. Resolve prediction (after end date, as creator)
const resolveResponse = await fetch(`/api/predictions/${prediction.id}/resolve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    correctOptionId: prediction.options[0].id // "Yes" was correct
  })
});

const { resolution, payouts } = await resolveResponse.json();
console.log('Prediction resolved!', payouts);
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_CREDENTIALS` | Wrong email/password |
| `USER_NOT_FOUND` | User doesn't exist |
| `PREDICTION_NOT_FOUND` | Prediction doesn't exist |
| `INSUFFICIENT_BALANCE` | Not enough coins |
| `PREDICTION_ENDED` | Betting closed |
| `PREDICTION_NOT_ENDED` | Cannot resolve yet |
| `ALREADY_RESOLVED` | Prediction already resolved |
| `INVALID_OPTION` | Option doesn't exist |
| `DUPLICATE_BET` | Already bet on this |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `FORBIDDEN` | Not authorized |
| `CONFLICT` | Resource conflict |

---

## API Versioning

Currently using unversioned API (`/api/*`).

Future versioning will use:
- `/api/v1/*` - Stable API
- `/api/v2/*` - Next version with breaking changes

Deprecation notices will be sent via response headers:
```
Deprecation: version="v1"; date="2026-01-01"
Sunset: Sat, 01 Jan 2026 00:00:00 GMT
```

---

## Testing API Endpoints

### Using cURL

```bash
# Create a prediction
curl -X POST https://predis.app/api/predictions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "question": "Will it rain tomorrow?",
    "endDate": "2025-01-02T18:00:00.000Z",
    "options": ["Yes", "No"],
    "visibility": "PUBLIC"
  }'

# Get timeline
curl -X GET "https://predis.app/api/predictions?limit=10" \
  -H "Cookie: next-auth.session-token=..."

# Place a bet
curl -X POST https://predis.app/api/bets \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "predictionId": "pred123",
    "optionId": "opt1",
    "amount": 100
  }'
```

### Using TypeScript/JavaScript

```typescript
// Helper function for API calls
async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Usage
const predictions = await apiCall('/predictions?limit=20');
const bet = await apiCall('/bets', {
  method: 'POST',
  body: JSON.stringify({ predictionId, optionId, amount }),
});
```

---

## Summary

This API reference covers all endpoints needed for the Predis MVP. Key points:

- All endpoints use REST conventions
- Authentication required for most endpoints
- Consistent error format across all endpoints
- Pagination via cursor-based approach
- Rate limiting to prevent abuse
- TypeScript-first with proper validation

Refer to `AI_DEVELOPMENT_GUIDELINES.md` for implementation patterns and best practices when building these endpoints.
