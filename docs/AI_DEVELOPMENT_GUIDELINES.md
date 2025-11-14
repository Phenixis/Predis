# Predis - AI Development Guidelines

## Purpose

This document provides guidelines specifically for AI models (like GitHub Copilot, Claude, GPT-4) that will be used to build and maintain the Predis application. Follow these guidelines to ensure high-quality, consistent, and maintainable code.

---

## General Principles for AI Coding

### 1. Always Read Context First

Before making any changes:
- Read the relevant documentation files in `/docs`
- Check the database schema in `DATABASE_SCHEMA.md`
- Review existing code patterns in the codebase
- Understand the feature requirements in `FEATURES_AND_FLOWS.md`
- Check API endpoints in `API_ENDPOINTS.md`

### 2. Maintain Consistency

- Follow existing code patterns and naming conventions
- Match the style of surrounding code
- Use the same libraries and approaches as existing code
- Don't introduce new dependencies without justification

### 3. Write Complete, Production-Ready Code

- No placeholders like `// TODO: Implement this`
- No `console.log()` statements (use proper logging)
- Include error handling for all operations
- Add loading and error states to UI components
- Validate all user inputs (client and server)

### 4. Think About Edge Cases

Consider:
- Empty states (no data)
- Loading states
- Error states (network, validation, server errors)
- Race conditions (concurrent requests)
- Permission checks (authorization)
- Input validation and sanitization

### 5. Optimize for Performance

- Use React Server Components where appropriate
- Minimize client bundle size
- Implement pagination for large lists
- Add database indexes for common queries
- Cache expensive computations
- Use optimistic updates for better UX

---

## Code Structure Guidelines

### File Organization

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth-related pages
│   │   ├── login/
│   │   │   └── page.tsx       # Login page
│   │   └── signup/
│   │       └── page.tsx       # Signup page
│   ├── (main)/                # Main app (requires auth)
│   │   ├── layout.tsx         # Main layout with nav
│   │   ├── timeline/
│   │   │   └── page.tsx       # Timeline feed
│   │   ├── predictions/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # Prediction detail
│   │   │   └── new/
│   │   │       └── page.tsx   # Create prediction
│   │   └── profile/
│   │       └── [username]/
│   │           └── page.tsx   # User profile
│   └── api/                   # API routes
│       ├── auth/[...nextauth]/route.ts
│       ├── predictions/
│       │   ├── route.ts       # GET, POST
│       │   └── [id]/
│       │       ├── route.ts   # GET, PATCH, DELETE
│       │       └── resolve/
│       │           └── route.ts
│       └── bets/
│           └── route.ts       # POST bet
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── predictions/           # Prediction-specific
│   │   ├── prediction-card.tsx
│   │   ├── prediction-form.tsx
│   │   └── prediction-options.tsx
│   ├── betting/
│   │   ├── bet-button.tsx
│   │   └── odds-display.tsx
│   └── layout/
│       ├── header.tsx
│       ├── nav.tsx
│       └── footer.tsx
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── redis.ts               # Redis client
│   ├── auth.ts                # NextAuth config
│   ├── utils.ts               # Utility functions
│   └── validations/
│       ├── prediction.ts      # Zod schemas
│       ├── bet.ts
│       └── user.ts
├── hooks/
│   ├── use-predictions.ts     # React Query hooks
│   ├── use-bets.ts
│   └── use-user.ts
├── services/                  # Business logic
│   ├── predictions.service.ts
│   ├── betting.service.ts
│   └── notifications.service.ts
└── types/
    ├── prediction.ts
    ├── bet.ts
    └── user.ts
```

### Naming Conventions

**Files**:
- Components: `PascalCase.tsx` or `kebab-case.tsx`
- Routes: `page.tsx`, `route.ts`, `layout.tsx`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`

**Variables & Functions**:
- `camelCase` for functions, variables, methods
- `PascalCase` for React components, types, interfaces
- `UPPER_SNAKE_CASE` for constants

**Database**:
- Tables: `PascalCase` (User, Prediction, Bet)
- Columns: `camelCase` (userId, createdAt)
- Relations: descriptive names (creator, bets, options)

---

## Component Development Guidelines

### React Component Template

```typescript
// components/predictions/prediction-card.tsx
'use client';

import { useState } from 'react';
import { Prediction, PredictionOption } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface PredictionCardProps {
  prediction: Prediction & {
    creator: { username: string; avatar: string | null };
    options: PredictionOption[];
  };
  onBetClick?: (optionId: string) => void;
}

export function PredictionCard({ prediction, onBetClick }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const timeRemaining = formatDistanceToNow(prediction.endDate, {
    addSuffix: true,
  });

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {/* Creator info */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={prediction.creator.avatar || '/default-avatar.png'}
          alt={prediction.creator.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">@{prediction.creator.username}</p>
          <p className="text-sm text-gray-500">{timeRemaining}</p>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold mb-2">{prediction.question}</h3>

      {/* Description (collapsible) */}
      {prediction.description && (
        <p
          className={`text-gray-600 mb-3 ${
            isExpanded ? '' : 'line-clamp-2'
          }`}
        >
          {prediction.description}
        </p>
      )}

      {/* Options with odds */}
      <div className="space-y-2 mb-3">
        {prediction.options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className="w-full justify-between"
            onClick={() => onBetClick?.(option.id)}
          >
            <span>{option.text}</span>
            <span className="font-bold">{option.currentOdds.toFixed(2)}x</span>
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{prediction.totalBets} bets</span>
        <span>{prediction.totalPool} coins in pool</span>
      </div>
    </Card>
  );
}
```

**Key Points**:
- ✅ TypeScript with proper types
- ✅ Props interface clearly defined
- ✅ Use Prisma types where applicable
- ✅ Accessible markup (alt text, semantic HTML)
- ✅ Tailwind CSS for styling
- ✅ Client component only when needed
- ✅ Optional callbacks for flexibility

---

### Server Component Template

```typescript
// app/(main)/timeline/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PredictionCard } from '@/components/predictions/prediction-card';
import { TimelineSkeleton } from '@/components/timeline/timeline-skeleton';

export default async function TimelinePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Timeline</h1>
      
      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}

async function TimelineContent({ userId }: { userId: string }) {
  const predictions = await prisma.prediction.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { visibility: 'PUBLIC' },
        {
          visibility: 'FRIENDS',
          creator: {
            OR: [
              {
                friendshipsInitiated: {
                  some: { receiverId: userId, status: 'ACCEPTED' },
                },
              },
              {
                friendshipsReceived: {
                  some: { initiatorId: userId, status: 'ACCEPTED' },
                },
              },
            ],
          },
        },
      ],
    },
    include: {
      creator: { select: { username: true, avatar: true } },
      options: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No predictions yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  );
}
```

**Key Points**:
- ✅ Async Server Component for data fetching
- ✅ Authentication check at page level
- ✅ Suspense boundary for streaming
- ✅ Loading skeleton for better UX
- ✅ Empty state handling
- ✅ Efficient database query with includes

---

## API Route Guidelines

### API Route Template

```typescript
// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Validation schema
const createPredictionSchema = z.object({
  question: z.string().min(10).max(200),
  description: z.string().max(500).optional(),
  endDate: z.string().datetime(),
  options: z.array(z.string().min(1).max(50)).min(2).max(5),
  category: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']),
});

// GET /api/predictions - Get timeline predictions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const predictions = await prisma.prediction.findMany({
      where: {
        status: 'ACTIVE',
        // Visibility logic here...
      },
      include: {
        creator: { select: { username: true, avatar: true } },
        options: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });

    return NextResponse.json({
      predictions,
      nextCursor: predictions.length === limit ? predictions[limit - 1].id : null,
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/predictions - Create prediction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createPredictionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { question, description, endDate, options, category, visibility } = validationResult.data;

    // Check end date is in future
    const endDateTime = new Date(endDate);
    if (endDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'End date must be in the future' },
        { status: 400 }
      );
    }

    // Create prediction with options
    const prediction = await prisma.prediction.create({
      data: {
        creatorId: session.user.id,
        question,
        description,
        endDate: endDateTime,
        category,
        visibility,
        status: 'ACTIVE',
        options: {
          create: options.map((text, index) => ({
            text,
            order: index,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalPredictions: { increment: 1 },
        experience: { increment: 10 },
      },
    });

    // TODO: Send notifications to friends (if visibility allows)

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Key Points**:
- ✅ Always check authentication first
- ✅ Use Zod for validation
- ✅ Return appropriate HTTP status codes
- ✅ Include error messages
- ✅ Use try-catch for error handling
- ✅ Update related data (stats, notifications)
- ✅ Return created resource with 201 status
- ✅ Pagination support (cursor-based)

---

## Database Guidelines

### Using Prisma

**Good Practices**:

```typescript
// ✅ Use select to fetch only needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    username: true,
    coinBalance: true,
  },
});

// ✅ Use transactions for related operations
await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { coinBalance: { decrement: amount } },
  }),
  prisma.bet.create({
    data: { userId, predictionId, amount, optionId },
  }),
]);

// ✅ Use proper error handling
try {
  const prediction = await prisma.prediction.findUniqueOrThrow({
    where: { id: predictionId },
  });
} catch (error) {
  if (error.code === 'P2025') {
    // Record not found
    return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
  }
  throw error;
}

// ✅ Use indexes for common queries
// Already defined in schema with @@index
```

**Bad Practices**:

```typescript
// ❌ Don't fetch everything
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    predictions: true, // Could be hundreds
    bets: true, // Could be thousands
  },
});

// ❌ Don't use multiple sequential queries
const user = await prisma.user.findUnique({ where: { id: userId } });
const bets = await prisma.bet.findMany({ where: { userId } });
// Use include or transaction instead

// ❌ Don't forget to handle unique constraint violations
await prisma.user.create({ data: { email } }); // Could throw P2002 error
```

---

## React Query (TanStack Query) Patterns

### Custom Hook Template

```typescript
// hooks/use-predictions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Prediction } from '@prisma/client';

// Fetch timeline predictions
export function usePredictions() {
  return useQuery({
    queryKey: ['predictions', 'timeline'],
    queryFn: async () => {
      const response = await fetch('/api/predictions');
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Fetch single prediction
export function usePrediction(id: string) {
  return useQuery({
    queryKey: ['predictions', id],
    queryFn: async () => {
      const response = await fetch(`/api/predictions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
      return response.json();
    },
    enabled: !!id,
  });
}

// Create prediction mutation
export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePredictionInput) => {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create prediction');
      }
      
      return response.json();
    },
    onSuccess: (newPrediction) => {
      // Invalidate timeline to show new prediction
      queryClient.invalidateQueries({ queryKey: ['predictions', 'timeline'] });
      
      // Optimistically add to cache
      queryClient.setQueryData(['predictions', newPrediction.id], newPrediction);
    },
    onError: (error) => {
      console.error('Failed to create prediction:', error);
      // Show toast notification
    },
  });
}

// Place bet mutation
export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ predictionId, optionId, amount }: PlaceBetInput) => {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId, optionId, amount }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place bet');
      }
      
      return response.json();
    },
    onMutate: async ({ predictionId, optionId, amount }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['predictions', predictionId] });
      
      const previousPrediction = queryClient.getQueryData(['predictions', predictionId]);
      
      // Update prediction optimistically
      queryClient.setQueryData(['predictions', predictionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          totalPool: old.totalPool + amount,
          totalBets: old.totalBets + 1,
          options: old.options.map((opt: any) =>
            opt.id === optionId
              ? { ...opt, totalCoins: opt.totalCoins + amount }
              : opt
          ),
        };
      });
      
      return { previousPrediction };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPrediction) {
        queryClient.setQueryData(
          ['predictions', variables.predictionId],
          context.previousPrediction
        );
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate to get accurate server data
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.predictionId] });
      queryClient.invalidateQueries({ queryKey: ['user', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
}
```

**Key Points**:
- ✅ Use queryKey arrays for organization
- ✅ Implement optimistic updates for better UX
- ✅ Invalidate related queries after mutations
- ✅ Handle loading and error states
- ✅ Set appropriate staleTime and refetchInterval

---

## Validation with Zod

### Validation Schema Examples

```typescript
// lib/validations/prediction.ts
import { z } from 'zod';

export const createPredictionSchema = z.object({
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question must be at most 200 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  endDate: z
    .string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), {
      message: 'End date must be in the future',
    }),
  options: z
    .array(z.string().min(1).max(50))
    .min(2, 'At least 2 options required')
    .max(5, 'At most 5 options allowed'),
  category: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']),
});

export const placeBetSchema = z.object({
  predictionId: z.string().cuid(),
  optionId: z.string().cuid(),
  amount: z
    .number()
    .int()
    .positive('Amount must be positive')
    .max(10000, 'Maximum bet is 10,000 coins'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  pushNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

// Type inference
export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;
export type PlaceBetInput = z.infer<typeof placeBetSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

**Usage in Components**:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPredictionSchema, CreatePredictionInput } from '@/lib/validations/prediction';

export function PredictionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePredictionInput>({
    resolver: zodResolver(createPredictionSchema),
    defaultValues: {
      visibility: 'FRIENDS',
      options: ['Yes', 'No'],
    },
  });

  const createMutation = useCreatePrediction();

  const onSubmit = (data: CreatePredictionInput) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('question')} placeholder="Your prediction question" />
      {errors.question && <span className="text-red-500">{errors.question.message}</span>}
      
      {/* More fields... */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Prediction'}
      </button>
    </form>
  );
}
```

---

## Error Handling Patterns

### API Error Response Format

```typescript
// Consistent error response structure
type ErrorResponse = {
  error: string;
  details?: any;
  code?: string;
};

// Usage in API routes
return NextResponse.json(
  {
    error: 'Insufficient balance',
    details: { required: 100, available: 50 },
    code: 'INSUFFICIENT_BALANCE',
  },
  { status: 400 }
);
```

### Client-Side Error Handling

```typescript
// Global error boundary
'use client';

import { useEffect } from 'react';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
    // Log to error tracking service (Sentry)
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## Testing Guidelines

### Unit Tests (Vitest)

```typescript
// services/__tests__/betting.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateOdds, validateBet } from '../betting.service';

describe('Betting Service', () => {
  describe('calculateOdds', () => {
    it('should calculate correct odds for binary prediction', () => {
      const totalPool = 1000;
      const optionCoins = 300;
      const odds = calculateOdds(totalPool, optionCoins);
      expect(odds).toBeCloseTo(3.33, 2);
    });

    it('should return 1.0 for empty pool', () => {
      const odds = calculateOdds(0, 0);
      expect(odds).toBe(1.0);
    });
  });

  describe('validateBet', () => {
    it('should reject bet exceeding balance', () => {
      const result = validateBet({
        amount: 1000,
        userBalance: 500,
        predictionStatus: 'ACTIVE',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Insufficient balance');
    });

    it('should reject bet on ended prediction', () => {
      const result = validateBet({
        amount: 100,
        userBalance: 500,
        predictionStatus: 'RESOLVED',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Prediction has ended');
    });
  });
});
```

---

## Security Best Practices

### 1. Authentication Checks

```typescript
// Always verify user session in API routes
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Authorization Checks

```typescript
// Verify user owns resource before allowing modifications
const prediction = await prisma.prediction.findUnique({
  where: { id: predictionId },
});

if (prediction.creatorId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 3. Input Validation

```typescript
// Always validate user input with Zod
const validationResult = schema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: validationResult.error },
    { status: 400 }
  );
}
```

### 4. Rate Limiting

```typescript
// Implement rate limiting for sensitive endpoints
import { ratelimit } from '@/lib/redis';

const identifier = session.user.id;
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

### 5. SQL Injection Prevention

```typescript
// ✅ Prisma automatically prevents SQL injection
await prisma.user.findMany({
  where: { username: userInput }, // Safe
});

// ❌ Never use raw queries with user input
await prisma.$queryRawUnsafe(`SELECT * FROM User WHERE username = '${userInput}'`);

// ✅ Use parameterized raw queries if needed
await prisma.$queryRaw`SELECT * FROM User WHERE username = ${userInput}`;
```

---

## Performance Optimization Checklist

### Database
- [ ] Indexes on frequently queried fields
- [ ] Use `select` instead of fetching all fields
- [ ] Implement pagination (cursor-based)
- [ ] Use transactions for related operations
- [ ] Cache expensive queries in Redis

### Frontend
- [ ] Use Server Components where possible
- [ ] Lazy load components with `next/dynamic`
- [ ] Optimize images with `next/image`
- [ ] Minimize client JavaScript bundle
- [ ] Implement skeleton loaders
- [ ] Use optimistic updates with React Query

### API
- [ ] Return only necessary data
- [ ] Use compression (gzip)
- [ ] Implement caching headers
- [ ] Rate limiting on expensive endpoints
- [ ] Background jobs for heavy tasks

---

## Deployment Checklist

### Before Deploying
- [ ] All environment variables set in Vercel
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Database seeded (if needed): `npx prisma db seed`
- [ ] Build succeeds locally: `npm run build`
- [ ] All tests pass: `npm run test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`

### After Deploying
- [ ] Test authentication flow
- [ ] Test prediction creation
- [ ] Test betting flow
- [ ] Test resolution flow
- [ ] Monitor error logs (Vercel, Sentry)
- [ ] Check database performance
- [ ] Verify push notifications work (mobile)

---

## Common Pitfalls to Avoid

### 1. Not Handling Edge Cases
```typescript
// ❌ Bad
const user = await prisma.user.findUnique({ where: { id } });
console.log(user.username); // Crashes if user is null

// ✅ Good
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
```

### 2. Forgetting to Invalidate Queries
```typescript
// ❌ Bad - UI won't update after mutation
const mutation = useMutation({ mutationFn: createPrediction });

// ✅ Good - Invalidate related queries
const mutation = useMutation({
  mutationFn: createPrediction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['predictions'] });
  },
});
```

### 3. Not Using Transactions for Related Operations
```typescript
// ❌ Bad - Race condition, partial updates
await prisma.user.update({
  where: { id: userId },
  data: { coinBalance: { decrement: amount } },
});
await prisma.bet.create({ data: { userId, amount } });

// ✅ Good - Atomic operation
await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { coinBalance: { decrement: amount } },
  }),
  prisma.bet.create({ data: { userId, amount } }),
]);
```

### 4. Over-fetching Data
```typescript
// ❌ Bad - Fetches all bets (could be thousands)
const prediction = await prisma.prediction.findUnique({
  where: { id },
  include: { bets: true },
});

// ✅ Good - Only fetch what's needed
const prediction = await prisma.prediction.findUnique({
  where: { id },
  include: {
    bets: {
      take: 10,
      orderBy: { placedAt: 'desc' },
      select: { id: true, amount: true, user: { select: { username: true } } },
    },
  },
});
```

---

## AI-Specific Tips

### When Implementing a New Feature

1. **Read the docs first**: Check `FEATURES_AND_FLOWS.md` for requirements
2. **Check the schema**: Ensure all needed fields exist in `DATABASE_SCHEMA.md`
3. **Look at similar code**: Find similar features already implemented
4. **Write the API route first**: Start with the backend logic
5. **Create the UI components**: Build reusable components
6. **Add validation**: Use Zod schemas
7. **Handle errors**: Add proper error states
8. **Test edge cases**: Think about what could go wrong
9. **Update docs**: If you add new patterns, document them

### When Debugging

1. **Check the logs**: Look at terminal output and Vercel logs
2. **Verify database state**: Use Prisma Studio (`npx prisma studio`)
3. **Test API directly**: Use curl or Postman to isolate issues
4. **Check browser console**: Look for client-side errors
5. **Simplify**: Remove complexity until it works, then add back

### When Refactoring

1. **Don't change too much at once**: Small, incremental changes
2. **Keep tests passing**: Run tests after each change
3. **Preserve behavior**: Refactor without changing functionality
4. **Update types**: Ensure TypeScript types are accurate
5. **Document changes**: Update relevant docs if patterns change

---

## Questions to Ask Before Implementing

Before writing code, an AI model should ask itself:

1. **What is the exact requirement?** (Check `FEATURES_AND_FLOWS.md`)
2. **What database tables are involved?** (Check `DATABASE_SCHEMA.md`)
3. **Does this need authentication?** (Almost always yes)
4. **What can go wrong?** (List edge cases)
5. **How will this scale?** (Consider performance)
6. **Is there existing code I can reference?** (Check similar features)
7. **What data needs validation?** (Create Zod schema)
8. **What should the user see while loading?** (Add loading state)
9. **What happens on error?** (Add error handling)
10. **How will I test this?** (Manual testing steps)

---

## Summary

When coding Predis as an AI model:

- ✅ **Read documentation first**
- ✅ **Follow existing patterns**
- ✅ **Write complete, production-ready code**
- ✅ **Handle all edge cases**
- ✅ **Validate all inputs**
- ✅ **Use transactions for related operations**
- ✅ **Optimize queries**
- ✅ **Add proper error handling**
- ✅ **Think about security**
- ✅ **Make it performant**

The goal is to build a high-quality, maintainable application that provides an excellent user experience!
