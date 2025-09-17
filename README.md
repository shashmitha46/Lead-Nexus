# Lead Nexus - Buyer Lead Management System

A comprehensive lead management system built with Next.js 13 (App Router), TypeScript, and Prisma.

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm or yarn

### Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/leadnexus"
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation Steps
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed initial data (demo user)
npx prisma db seed

# Start development server
npm run dev
```

## Design & Architecture

### Validation Strategy
- Form validation using Zod schemas (shared between client/server)
- Server-side validation in API routes
- Custom validators for business rules (e.g., budget range validation)

### Data Flow & State Management
- SSR-first approach for lead listing and filtering
- Client-side state for form handling and search
- URL-synchronized filters and pagination
- Optimistic updates for status changes

### Security & Ownership
- Authentication via NextAuth.js with magic link
- Row-level security through `ownerId` field
- Server-side ownership validation on all mutations
- Rate limiting on create/update actions (10 req/min)

## Features Implementation Status

### Completed
- ✅ Core CRUD operations for leads
- ✅ Search & filter with server-side pagination
- ✅ CSV import/export with validation
- ✅ Basic authentication and ownership checks
- ✅ Form validation (client + server)
- ✅ Change history tracking

### Skipped/Future
- ❌ File attachments (skipped due to time constraints)
- ❌ Full-text search (would require additional indexing)
- ❌ Admin role (focusing on core user flow first)

### Testing
- Unit tests for validation logic
- Basic E2E tests for critical flows
- Run tests: `npm test`

## API Rate Limits
- Create: 10 requests/minute/user
- Update: 20 requests/minute/user
- Import: 2 requests/minute/user

## Performance Considerations
- Server-side pagination (10 items/page)
- Debounced search (300ms)
- Optimized database queries with proper indexing

## Known Limitations
- Maximum 200 rows per CSV import
- Search limited to basic fields (name, email, phone)
- Single user ownership (no team sharing)