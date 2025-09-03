# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Subs Tracker is a Next.js 14 application for tracking subscription services. It uses:
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Prisma ORM  
- **Authentication**: JWT-based authentication with jose library (Edge Runtime compatible)
- **UI**: Tailwind CSS + Radix UI components + Recharts for data visualization
- **Deployment**: Vercel (configured)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (includes Prisma generate)
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Generate Prisma client (runs automatically on build/install)
npx prisma generate

# View database schema
npx prisma db push --preview-feature

# Reset database (be careful!)
npx prisma migrate reset
```

## Architecture Overview

### Database Schema
- **User** model: id, email, password, name, createdAt, updatedAt, subscriptions[]
- **Subscription** model: id, name, price, billingDate, categories[], description, createdAt, userId (foreign key)
- MongoDB with Prisma client for type safety
- User-subscription relationship: one-to-many with cascade delete
- Connection configured in `lib/db.ts` with development logging

### App Structure (Next.js App Router)
- **Root Layout**: `app/layout.tsx` - Sets up Inter font, Navbar component, and authentication context
- **Authentication Pages**: `app/login/`, `app/signup/` - Auth forms with client-side validation
- **Protected Routes**: `app/dashboard/`, `app/subscriptions/`, `app/analytics/`, `app/profile/`, `app/settings/`
- **Landing Page**: `app/page.tsx` - Marketing page for unauthenticated users
- **Server Actions**: `app/actions/subscription.ts` - User-specific CRUD operations
- **API Routes**: `app/api/auth/` - Login, signup, logout endpoints
- **Components**: `components/Navbar.tsx` (with profile menu), UI primitives in `components/ui/`

### Key Libraries
- **Data Fetching**: Server Components + Server Actions pattern
- **Styling**: Tailwind CSS with custom utilities
- **Charts**: Recharts for spending visualization
- **Forms**: Native FormData with Server Actions (no form library)
- **Icons**: Lucide React + React Icons

### Business Logic
**Authentication** (`lib/auth.ts`):
- JWT token creation/verification with jose library (Edge Runtime compatible)
- Password hashing with bcryptjs
- HTTP-only cookie management for secure token storage
- `getCurrentUser()` - Server-side user identification

**Subscriptions** (`lib/subscriptions.ts`):
- `getUserSubscriptions(userId)` - Fetches user-specific subscriptions
- `calculateSubscriptionStats()` - Computes monthly/annual totals and upcoming renewals
- `getSpendingByCategory()` - Aggregates spending data for charts

## Important Configuration

### Environment Variables
Required for development and production:
```
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret-here  # Currently unused but kept for potential future auth
```

### Next.js Configuration
- TypeScript/ESLint errors ignored during builds (see `next.config.js`)
- Edge Runtime optimizations for Prisma compatibility
- Security headers configured
- Package import optimizations for Lucide React and React Icons

### Authentication Middleware
- Route protection in `middleware.ts` using jose library
- Public routes: `/`, `/login`, `/signup`
- Protected routes: `/dashboard`, `/subscriptions`, `/analytics`, `/profile`, `/settings`
- Automatic redirects: authenticated users → dashboard, unauthenticated users → login
- Invalid token handling with cookie cleanup

### Database Connection
- Prisma client singleton pattern in `lib/db.ts`
- Development logging enabled for queries/errors/warnings
- Connection testing on startup with graceful error handling

## Development Patterns

### Data Flow
1. Server Components fetch data using functions from `lib/subscriptions.ts`
2. Client Components handle interactivity (forms, charts)
3. Server Actions in `app/actions/` handle mutations
4. `revalidatePath()` refreshes data after mutations

### Error Handling
- Database errors logged only in development mode
- Graceful fallbacks for missing data (empty states)
- Try-catch blocks around all database operations

### Styling Approach
- Utility-first Tailwind CSS
- Consistent spacing and color scheme
- Responsive grid layouts (`grid-cols-1 md:grid-cols-3`)
- Custom animations via `tailwindcss-animate`

### Component Organization
- UI primitives in `components/ui/` (shadcn/ui style)
- Feature-specific components in `app/components/`
- Server and Client Components clearly separated

## Testing & Deployment

### Local Testing
```bash
npm run build  # Test production build
npm start      # Test production server locally
```

### Deployment Notes
- Configured for Vercel deployment
- MongoDB Atlas recommended for database
- Environment variables must be set in Vercel dashboard
- Build includes automatic Prisma client generation
- Security headers and performance optimizations configured
