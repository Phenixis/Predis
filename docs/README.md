# Predis Documentation Index

Welcome to the Predis project documentation! This is a social prediction and betting app where friends can create predictions about real-life events and bet virtual coins.

## 📚 Documentation Overview

This documentation is designed to help both human developers and AI models build and maintain the Predis application effectively.

### Core Documentation Files

1. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**
   - Vision and core concepts
   - Key features overview
   - User flow examples
   - Success metrics
   - Design principles

2. **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)**
   - Complete tech stack (Next.js, PostgreSQL, Capacitor)
   - Architecture layers and diagrams
   - Project structure
   - Data flow patterns
   - Security considerations
   - Performance optimizations
   - Deployment strategy

3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
   - Complete Prisma schema
   - All models and relationships
   - Indexes and performance considerations
   - Data integrity rules
   - Query examples
   - Migration guidelines

4. **[FEATURES_AND_FLOWS.md](./FEATURES_AND_FLOWS.md)**
   - Detailed user stories
   - Step-by-step feature flows
   - Edge cases and validation
   - All core features explained
   - Feature priority matrix

5. **[AI_DEVELOPMENT_GUIDELINES.md](./AI_DEVELOPMENT_GUIDELINES.md)**
   - **Essential for AI models building this app**
   - Code structure and patterns
   - Component templates
   - API route templates
   - Best practices and common pitfalls
   - Testing strategies

6. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**
   - Complete API reference
   - Request/response examples
   - Error codes and handling
   - Rate limits
   - Authentication flow

## 🚀 Quick Start for AI Models

If you're an AI model tasked with building features for Predis, follow this workflow:

### 1. Understand the Feature
- Read the relevant section in `FEATURES_AND_FLOWS.md`
- Understand the user story and acceptance criteria
- Identify edge cases

### 2. Check the Database
- Review `DATABASE_SCHEMA.md` to understand data models
- Ensure all needed fields exist
- Check relationships and constraints

### 3. Review Patterns
- Read `AI_DEVELOPMENT_GUIDELINES.md` for code patterns
- Look at API route templates
- Follow component structure guidelines

### 4. Implement
- Create API routes following `API_ENDPOINTS.md`
- Build UI components with proper validation
- Add error handling and loading states
- Use transactions for related operations

### 5. Test
- Test happy path
- Test edge cases
- Verify database constraints
- Check authentication/authorization

## 🏗️ Project Structure

```
predis/
├── docs/                          # This documentation
│   ├── README.md                  # This file
│   ├── PROJECT_OVERVIEW.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── FEATURES_AND_FLOWS.md
│   ├── AI_DEVELOPMENT_GUIDELINES.md
│   └── API_ENDPOINTS.md
├── src/
│   ├── app/                       # Next.js App Router
│   ├── components/                # React components
│   ├── lib/                       # Utilities and configs
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # Business logic
│   └── types/                     # TypeScript types
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Seed data
├── public/                        # Static assets
└── capacitor.config.ts            # Mobile app config
```

## 🎯 Key Features (MVP)

### Core Features
- ✅ User authentication (signup/login)
- ✅ Create predictions with multiple options
- ✅ Timeline feed of active predictions
- ✅ Betting system with dynamic odds
- ✅ Prediction resolution with automatic payouts
- ✅ User profiles with statistics
- ✅ Coin economy (virtual currency)

### Social Features
- ✅ Friend system
- ✅ Friend-only predictions
- ✅ Leaderboard
- ✅ Notifications

### Mobile Features
- ✅ iOS and Android support via Capacitor
- ✅ Push notifications
- ✅ Native-like experience

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+, React 18+, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, NextAuth.js |
| **Database** | PostgreSQL (via Neon/Supabase) |
| **ORM** | Prisma |
| **Caching** | Redis (Upstash) |
| **Mobile** | Capacitor 6+ |
| **Hosting** | Vercel |
| **State** | React Query (TanStack Query) |

## 📖 How to Use This Documentation

### For Human Developers

1. **Getting Started**: Read `PROJECT_OVERVIEW.md` first
2. **Architecture**: Understand the tech stack in `TECHNICAL_ARCHITECTURE.md`
3. **Database**: Review schema in `DATABASE_SCHEMA.md`
4. **Features**: Implement features using `FEATURES_AND_FLOWS.md` as a guide
5. **API**: Reference `API_ENDPOINTS.md` when building or consuming APIs

### For AI Models (Like You!)

1. **Always start by reading context**:
   - What feature am I building? → `FEATURES_AND_FLOWS.md`
   - What data do I need? → `DATABASE_SCHEMA.md`
   - How should I structure code? → `AI_DEVELOPMENT_GUIDELINES.md`
   - What API should I create? → `API_ENDPOINTS.md`

2. **Follow patterns**:
   - Use templates from `AI_DEVELOPMENT_GUIDELINES.md`
   - Match existing code style
   - Don't introduce new patterns without justification

3. **Think about edge cases**:
   - What if user has no balance?
   - What if prediction already ended?
   - What if network fails?
   - What about concurrent requests?

4. **Write production-ready code**:
   - No placeholders or TODOs
   - Proper error handling
   - Input validation (client + server)
   - Loading and error states in UI

## 🔍 Common Tasks

### Task: Create a New Prediction
1. Read: `FEATURES_AND_FLOWS.md` → Section 3.1
2. Check: `DATABASE_SCHEMA.md` → Prediction model
3. API: `API_ENDPOINTS.md` → `POST /api/predictions`
4. Template: `AI_DEVELOPMENT_GUIDELINES.md` → API Route Template
5. Validation: Use Zod schema from guidelines

### Task: Place a Bet
1. Read: `FEATURES_AND_FLOWS.md` → Section 4.1
2. Check: `DATABASE_SCHEMA.md` → Bet model, transactions
3. API: `API_ENDPOINTS.md` → `POST /api/bets`
4. Important: Use database transactions!
5. Calculate: Odds update logic

### Task: Resolve Prediction
1. Read: `FEATURES_AND_FLOWS.md` → Section 5.1
2. Check: `DATABASE_SCHEMA.md` → Transaction model
3. API: `API_ENDPOINTS.md` → `POST /api/predictions/[id]/resolve`
4. Important: Use transactions for payouts
5. Send: Notifications to all bettors

### Task: Build Timeline UI
1. Read: `FEATURES_AND_FLOWS.md` → Section 2.1
2. Component: `AI_DEVELOPMENT_GUIDELINES.md` → Component templates
3. Data: Use React Query hooks
4. States: Loading, error, empty states
5. Infinite scroll: Implement pagination

## 🔐 Security Checklist

Before deploying any feature:

- [ ] Authentication check on API route
- [ ] Authorization check (user owns resource)
- [ ] Input validation (Zod schema)
- [ ] SQL injection prevention (Prisma handles this)
- [ ] Rate limiting on sensitive endpoints
- [ ] CSRF protection (Next.js handles this)
- [ ] Secure password hashing (bcrypt)
- [ ] Session management (NextAuth.js)

## 🚨 Common Pitfalls

1. **Forgetting transactions**: Always use Prisma transactions for coin transfers
2. **Not invalidating queries**: Update React Query cache after mutations
3. **Missing edge cases**: Empty states, error states, loading states
4. **Over-fetching**: Use `select` instead of fetching all fields
5. **No pagination**: Implement cursor-based pagination for lists
6. **Hardcoded values**: Use environment variables for configs
7. **No error handling**: Wrap API calls in try-catch
8. **Missing validation**: Validate on both client and server

## 📈 Development Workflow

### Adding a New Feature

```
1. Read feature requirements (FEATURES_AND_FLOWS.md)
2. Check database schema (DATABASE_SCHEMA.md)
3. Design API endpoint (API_ENDPOINTS.md)
4. Implement API route (AI_DEVELOPMENT_GUIDELINES.md)
5. Create UI components (AI_DEVELOPMENT_GUIDELINES.md)
6. Add validation (Zod schemas)
7. Test edge cases
8. Update documentation (if needed)
```

### Fixing a Bug

```
1. Reproduce the bug
2. Check related code
3. Review error logs
4. Identify root cause
5. Write fix
6. Test fix thoroughly
7. Verify no regressions
```

### Refactoring Code

```
1. Understand current implementation
2. Identify improvement opportunities
3. Plan refactoring (small steps)
4. Ensure tests pass after each step
5. Update types/interfaces
6. Update documentation
```

## 🎓 Learning Resources

### Next.js
- App Router documentation
- Server Components vs Client Components
- API Routes best practices

### Prisma
- Schema definition
- Migrations
- Transactions
- Performance optimization

### React Query
- Query invalidation
- Optimistic updates
- Error handling
- Pagination

### Capacitor
- Native plugin usage
- iOS/Android configuration
- Push notifications
- Build process

## 📞 Support & Questions

When debugging or asking questions:

1. **Be specific**: Include error messages, code snippets, file paths
2. **Provide context**: What were you trying to do?
3. **Show what you tried**: What debugging steps did you take?
4. **Reference docs**: Which documentation did you check?

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- Core prediction & betting features
- Basic social features
- Web + mobile apps

### Phase 2: Enhancement
- Advanced analytics
- Achievements system
- Groups/communities
- Comments on predictions

### Phase 3: Scale
- Real-time updates (WebSockets)
- Advanced search & filters
- Content moderation tools
- Performance optimizations

### Future
- Live predictions (sports, events)
- Video/image predictions
- Premium features
- Third-party integrations

## 📝 Documentation Maintenance

This documentation should be updated when:

- New features are added
- Database schema changes
- API endpoints change
- New patterns are introduced
- Architecture decisions change

Keep documentation in sync with code to maintain its value!

---

## 🌟 Quick Reference

**Building a feature?** → Start with `FEATURES_AND_FLOWS.md`

**Need database info?** → Check `DATABASE_SCHEMA.md`

**Writing code?** → Follow `AI_DEVELOPMENT_GUIDELINES.md`

**Creating API?** → Reference `API_ENDPOINTS.md`

**Understanding architecture?** → Read `TECHNICAL_ARCHITECTURE.md`

**Getting overview?** → See `PROJECT_OVERVIEW.md`

---

**Last Updated**: November 14, 2025

**Version**: 1.0.0

**Maintained by**: The Predis Team
