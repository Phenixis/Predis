# Setup Guide - Getting Started with Predis

## 🎉 Phase 0 Complete!

The project foundation has been set up. Here's what's been done:

### ✅ Completed
- Next.js 14 project with TypeScript
- Tailwind CSS configured
- Prisma schema defined
- Capacitor configured for mobile
- React Query set up
- Project structure created
- Seed data script ready
- All documentation written

## 🚀 Next Steps

### 1. Set Up Database

Choose one of these PostgreSQL hosting options:

#### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Create a new project named "Predis"
4. Copy the connection string

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Sign up for free
3. Create a new project named "Predis"
4. Go to Settings > Database
5. Copy the connection string (URI format)

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Then create database:
createdb predis
```

### 2. Configure Environment Variables

```bash
# Create .env.local file
cp .env.example .env.local
```

Edit `.env.local` and add your database URL:
```env
DATABASE_URL="postgresql://user:password@host:5432/predis?schema=public"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Run Database Migrations

```bash
# This will create all tables in your database
npx prisma migrate dev --name init

# Seed the database with test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

### 5. Explore Prisma Studio (Optional)

```bash
# Visual database browser
npm run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can view and edit your database.

## 📝 Test Accounts

After seeding, you can use these test accounts:

| Email | Username | Password |
|-------|----------|----------|
| alice@example.com | alice | password123 |
| bob@example.com | bob | password123 |
| charlie@example.com | charlie | password123 |

## 🔍 Verify Everything Works

1. **Database Connection**: Run `npx prisma db push` to verify connection
2. **TypeScript**: Run `npm run type-check` (should show no errors)
3. **Build**: Run `npm run build` (should complete successfully)
4. **Dev Server**: Run `npm run dev` and visit localhost:3000

## 📚 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma Client
npm run db:migrate      # Run migrations
npm run db:push         # Push schema changes (dev only)
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with test data

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript types
```

## 🎯 What to Build Next

Now that Phase 0 is complete, you're ready to start Phase 1: **Authentication System**

See `docs/DEVELOPMENT_ROADMAP.md` for detailed tasks.

### Quick Start Phase 1

The authentication system includes:
- NextAuth.js setup
- Login/signup pages
- API routes for auth
- Protected routes
- Session management

Check `docs/AI_DEVELOPMENT_GUIDELINES.md` for code templates and patterns!

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check if database exists
- Ensure PostgreSQL is running
- Try running `npx prisma db push` to test connection

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma Client
- Restart your IDE/VS Code

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

## 💡 Tips

1. **Use Prisma Studio** to visually explore your database
2. **Check the docs** folder for detailed implementation guides
3. **Follow the roadmap** in `DEVELOPMENT_ROADMAP.md`
4. **Use AI assistance** with the guidelines in `AI_DEVELOPMENT_GUIDELINES.md`
5. **Commit often** with descriptive messages

## 📞 Need Help?

- Check the documentation in `/docs`
- Review the roadmap for task details
- Look at the API reference for endpoint specs
- Use the development guidelines for code patterns

Happy coding! 🚀
