# Predis - Technical Architecture

## Tech Stack Overview

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Context + React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Mobile Conversion**: Capacitor 6+
- **Icons**: Lucide React or Heroicons

### Backend
- **API**: Next.js API Routes (App Router)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod
- **API Client**: TanStack Query for data fetching

### Database
- **Primary DB**: PostgreSQL (via Neon, Supabase, or Railway)
- **ORM**: Prisma
- **Caching**: Redis (Upstash or Railway) for real-time odds calculations
- **File Storage**: Cloudinary or Uploadthing (for future image uploads)

### Infrastructure
- **Hosting**: Vercel (Next.js)
- **Database**: Neon or Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Sentry

### Mobile Build
- **iOS**: Xcode + Capacitor
- **Android**: Android Studio + Capacitor
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Native APIs**: Capacitor plugins

## Why These Choices?

### Next.js + Capacitor
- **Pros**: 
  - Single codebase for web, iOS, Android
  - Next.js App Router provides excellent DX
  - Server components reduce client bundle size
  - Easy API routes for backend logic
  - Capacitor provides near-native performance
  - Hot reload for fast development
  
- **Cons**:
  - Slight performance overhead vs pure native
  - Some native features require plugins
  
- **Mitigation**: Use Capacitor plugins for device features, optimize bundle size

### PostgreSQL (Not MongoDB/NoSQL)
- **Reasoning**:
  - Predictions have clear relationships (users → predictions → bets)
  - ACID transactions critical for coin transfers (no double-spending)
  - Complex queries needed (leaderboards, statistics, filtering)
  - Strong consistency required for betting/payouts
  - Better for aggregations (odds calculations, user stats)
  
- **Scalability**: 
  - PostgreSQL scales well to millions of users with proper indexing
  - Use read replicas for timeline queries
  - Redis cache for hot data (active predictions, odds)

### Prisma ORM
- **Benefits**:
  - Type-safe database queries
  - Easy migrations
  - Great TypeScript integration
  - Schema-first approach
  - Built-in connection pooling

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Mobile Apps (iOS/Android)        │
│              via Capacitor               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Next.js Frontend               │
│  (React Components + Server Components)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Next.js API Routes              │
│        (Business Logic Layer)            │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌──────────────┐
│  PostgreSQL   │   │    Redis     │
│   (Prisma)    │   │   (Cache)    │
└───────────────┘   └──────────────┘
```

## Project Structure

```
predis/
├── .capacitor/                 # Capacitor build output
├── android/                    # Android native project
├── ios/                        # iOS native project
├── public/                     # Static assets
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (main)/           # Main app pages
│   │   │   ├── timeline/
│   │   │   ├── predictions/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── api/              # API routes
│   │   │   ├── auth/
│   │   │   ├── predictions/
│   │   │   ├── bets/
│   │   │   └── users/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── predictions/      # Prediction-specific components
│   │   ├── betting/          # Betting UI components
│   │   └── layout/           # Layout components
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── redis.ts          # Redis client
│   │   ├── auth.ts           # Auth config
│   │   ├── utils.ts          # Utility functions
│   │   └── validations/      # Zod schemas
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript types
│   └── services/             # Business logic services
│       ├── predictions.ts
│       ├── betting.ts
│       ├── users.ts
│       └── notifications.ts
├── capacitor.config.ts        # Capacitor config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Data Flow

### Creating a Prediction
```
1. User fills form in frontend
2. Frontend validates with Zod schema
3. POST /api/predictions
4. API validates auth + data
5. Prisma creates prediction in PostgreSQL
6. Redis caches prediction (if needed)
7. Return prediction data
8. Frontend updates UI optimistically
```

### Placing a Bet
```
1. User selects outcome + amount
2. Frontend validates (sufficient balance)
3. POST /api/bets
4. API starts transaction:
   a. Check user balance
   b. Deduct coins from user
   c. Create bet record
   d. Update prediction bet totals
   e. Commit transaction
5. Redis updates cached odds
6. Return updated prediction + user balance
7. Frontend updates UI
```

### Resolving a Prediction
```
1. Creator marks outcome
2. POST /api/predictions/{id}/resolve
3. API starts transaction:
   a. Mark prediction as resolved
   b. Calculate payouts for winners
   c. Update all winner balances
   d. Record payout transactions
   e. Commit transaction
4. Trigger notifications to all bettors
5. Clear Redis cache
6. Return resolution data
```

## Real-Time Features

### Live Odds Updates
- Use React Query with polling (every 5-10s)
- Or implement WebSockets for true real-time (via Pusher or Socket.io)
- Cache odds in Redis for fast reads
- Recalculate on every bet placement

### Notifications
- **Web**: Service Workers + Push API
- **Mobile**: Firebase Cloud Messaging via Capacitor
- **In-app**: React Query invalidation + toast notifications

## Security Considerations

### Authentication
- Session-based auth with NextAuth.js
- HTTP-only cookies for session tokens
- CSRF protection enabled
- Rate limiting on auth endpoints

### Authorization
- Middleware checks on all API routes
- User can only:
  - Edit their own predictions (before any bets)
  - Resolve their own predictions
  - View public or friends' predictions
- Admin role for moderation

### Data Validation
- Double validation: client (Zod) + server (Zod)
- Sanitize user inputs
- Parameterized queries (Prisma handles this)
- Rate limiting on prediction creation, betting

### Transactions
- Use Prisma transactions for coin transfers
- Optimistic locking to prevent race conditions
- Idempotency keys for bet placement

## Performance Optimizations

### Database
- Indexes on: user_id, prediction_id, end_date, created_at
- Compound indexes for common queries
- Pagination for timeline (cursor-based)
- Aggregate queries cached in Redis

### Frontend
- Next.js Image optimization
- Code splitting by route
- Lazy load components
- Optimize bundle size (analyze with @next/bundle-analyzer)
- Server components where possible

### Caching Strategy
- **Static**: Public landing page, docs
- **ISR**: User profiles (revalidate every 5min)
- **Dynamic**: Timeline, active predictions
- **Redis**: Odds calculations, hot predictions

## Mobile-Specific Considerations

### Capacitor Plugins Needed
- `@capacitor/app` - App lifecycle events
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/splash-screen` - Native splash screen
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/haptics` - Touch feedback
- `@capacitor/share` - Share predictions
- `@capacitor/local-notifications` - Local reminders

### Platform Differences
- iOS: Handle safe areas, notch
- Android: Back button behavior, permissions
- Both: Offline mode with service workers

### Build Process
```bash
# Development
npm run dev

# Build for web
npm run build

# Build for mobile
npm run build
npx cap sync
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

## Monitoring & Analytics

### Key Metrics to Track
- API response times
- Database query performance
- Error rates (by endpoint)
- User engagement (predictions/bets per user)
- Conversion funnel (signup → first prediction → first bet)

### Tools
- **Vercel Analytics**: Page views, performance
- **Sentry**: Error tracking, performance monitoring
- **Custom events**: Track prediction creation, bets, resolutions

## Scalability Plan

### Phase 1: MVP (0-1K users)
- Single Vercel deployment
- Neon free tier (PostgreSQL)
- Upstash free tier (Redis)
- No optimization needed

### Phase 2: Growth (1K-100K users)
- Upgrade to Neon Pro (connection pooling)
- Implement Redis caching aggressively
- Add read replicas for timeline queries
- CDN for static assets

### Phase 3: Scale (100K+ users)
- Horizontal scaling with Vercel
- Database sharding (if needed)
- Message queue for notifications (BullMQ + Redis)
- Dedicated microservices for heavy tasks (odds calculation)

## Development Workflow

### Local Development
1. Clone repo
2. Install dependencies: `npm install`
3. Set up `.env.local` with DB connection
4. Run migrations: `npx prisma migrate dev`
5. Seed database: `npx prisma db seed`
6. Start dev server: `npm run dev`
7. Open http://localhost:3000

### Mobile Development
1. Build Next.js: `npm run build`
2. Sync to Capacitor: `npx cap sync`
3. Open native IDE: `npx cap open ios/android`
4. Run on simulator/device from IDE
5. For live reload: Use Capacitor's live update feature

### Testing Strategy
- **Unit**: Vitest for utilities, services
- **Integration**: API route testing with MSW
- **E2E**: Playwright for critical flows
- **Mobile**: Manual testing + eventually Detox or Appium

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://..."

# Optional
SENTRY_DSN="..."
FIREBASE_CONFIG="..."
```

## Debugging Tips

### Web Development
- Use Next.js Dev Tools
- React Developer Tools
- Network tab for API calls
- Prisma Studio for database inspection: `npx prisma studio`

### Mobile Development
- Chrome DevTools for iOS (Safari Web Inspector)
- Chrome DevTools for Android (chrome://inspect)
- Native logs in Xcode/Android Studio
- Capacitor CLI logs: `npx cap run ios --livereload`

### Common Issues
- **CORS errors**: Check Next.js config, use relative URLs
- **Auth not persisting**: Check cookie settings for mobile
- **Slow queries**: Use `prisma.$queryRaw` with EXPLAIN
- **Build failures**: Clear `.next` and `node_modules`, rebuild
