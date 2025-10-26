# E-Learning Platform

A comprehensive learning management system built with Next.js 14, featuring role-based access control, course management, and progress tracking.

## Features

### Multi-Role System
- **Admin**: Full platform management, user administration, course validation, analytics
- **Sub-Admin**: School-level management, manual enrollments, local analytics, attendance tracking
- **Teacher/Trainer**: Course creation, student management, quiz creation, grading
- **Student**: Course enrollment, progress tracking, quiz attempts, certificate generation

### Core Functionality
- Secure authentication with NextAuth.js and bcrypt password hashing
- Role-based access control (RBAC) with protected routes
- **Modular course structure** with Course → Module → Chapter hierarchy
- Course management with domains, chapters, and multimedia content
- Module-based content organization for better course structure
- Quiz system with auto and manual grading
- Progress tracking with module-level analytics
- Completion certificates
- Final project submissions and reviews
- Responsive design with dark theme

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v4
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query
- **Runtime**: Bun (recommended) or Node.js

## Getting Started

### Prerequisites

- Bun 1.0+ or Node.js 18+
- PostgreSQL database (Neon, Supabase, or local)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-learning-platform
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://neondb_owner:npg_eW9UazAH3jdZ@ep-dry-grass-ad4nbvok-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Push database schema:
```bash
bun run db:push
```

5. Seed the database with test data:
```bash
bun run db:seed
```

6. Start the development server:
```bash
bun run dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Test Accounts

After seeding, use these credentials to test different roles:

| Email                | Password    | Role      |
| -------------------- | ----------- | --------- |
| admin@example.com    | password123 | ADMIN     |
| subadmin@example.com | password123 | SUB_ADMIN |
| teacher@example.com  | password123 | TRAINER   |
| student@example.com  | password123 | STUDENT   |

## Project Structure

```
├── app/
│   ├── (admin)/          # Admin dashboard and pages
│   ├── (auth)/           # Login, register, unauthorized
│   ├── (student)/        # Student dashboard and pages
│   ├── (sub-admin)/      # Sub-admin dashboard and pages
│   ├── (teacher)/        # Teacher dashboard and pages
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── layout/           # Shared layout (Sidebar, Header)
│   ├── student/          # Student-specific components
│   ├── sub-admin/        # Sub-admin components
│   ├── teacher/          # Teacher components
│   └── ui/               # shadcn/ui components
├── drizzle/
│   ├── migrations/       # Database migrations
│   ├── schema.ts         # Database schema
│   ├── seed.ts           # Seed data script
│   └── test-auth-flow.ts # Authentication tests
├── lib/
│   ├── auth/             # NextAuth configuration
│   ├── db/               # Database queries and utilities
│   ├── schemas/          # Zod validation schemas
│   └── utils/            # Utility functions
└── middleware.ts         # RBAC middleware
```

## Database Schema

### Core Tables
- **users**: User accounts with roles (ADMIN, SUB_ADMIN, TRAINER, STUDENT)
- **domains**: Course categories/subjects
- **courses**: Course content with teacher assignments
- **modules**: Logical grouping of related chapters within a course _(NEW)_
- **chapters**: Course chapters now associated with modules (not directly with courses)
- **enrollments**: Student course enrollments
- **chapter_progress**: Student progress tracking

### Modular Course Structure

The platform uses a three-level hierarchy for organizing course content:

```
Course
  └─ Module (e.g., "HTML Fundamentals")
      ├─ Chapter 1: "Introduction to HTML"
      ├─ Chapter 2: "HTML Document Structure"
      └─ Chapter 3: "Semantic HTML"
```

**Benefits**:
- **Better Organization**: Group related chapters into logical modules
- **Improved Navigation**: Students can see course structure at a glance
- **Progress Tracking**: View completion percentage per module
- **Flexible Structure**: Easily reorder modules and chapters

**Implementation Notes**:
- Modules reference courses via `courseId`
- Chapters reference modules via `moduleId` (changed from `courseId`)
- Cascade deletes ensure referential integrity
- Module management is ADMIN-only (TRAINER role cannot manage course content)

### Assessment Tables
- **content_items**: Flexible content system (video, text, quiz, test, exam)
- **content_item_attempts**: Student attempts on quizzes/tests/exams
- **final_projects**: Course final project requirements
- **project_submissions**: Student project submissions and grades

## Scripts

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint

# Database
bun run db:push          # Push schema to database
bun run db:seed          # Seed test data

# Testing
bun run drizzle/test-auth-flow.ts  # Run auth tests
```

## Authentication Flow

1. User registers via `/register` with email, password, name, and role
2. Password is hashed with bcrypt before storage
3. User logs in via `/login` with credentials
4. NextAuth creates a JWT session with user data and role
5. Middleware checks authentication and role for protected routes
6. User is redirected to role-specific dashboard
7. Logout destroys session and redirects to login

## Testing

Run the comprehensive authentication test suite:

```bash
bun run drizzle/test-auth-flow.ts
```

This tests:
- User registration and password hashing
- Login with valid/invalid credentials
- Role-based redirects
- Protected route access
- Authorization per role
- Session structure

See `drizzle/README-AUTH-TESTS.md` for details.

## Deployment

This project is configured with CI/CD for automated deployments to Vercel.

### Quick Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables (see below)
4. Deploy automatically on every push to `main`

**📖 For detailed setup instructions, see [CI-CD-SETUP.md](./CI-CD-SETUP.md)**

### Environment Variables for Production

```env
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NODE_ENV=production
```

### CI/CD Features

✅ **Automatic deployments** on push to `main`  
✅ **Preview deployments** for all pull requests  
✅ **Automated testing** via GitHub Actions  
✅ **Build verification** before deployment  

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment documentation.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Auth and RBAC Pattern

This project enforces authentication and role-based access primarily via NextAuth middleware for protected route prefixes:

- /admin → ADMIN
- /sous-admin → SUB_ADMIN
- /formateur → TRAINER
- /etudiant → STUDENT

Guidelines:

- Use middleware for access control so unauthorized requests are rejected early, improving perceived navigation speed.
- In layouts/pages inside protected segments, avoid calling requireAuth unless the route’s access rules differ from the prefix-level rule. Prefer getCurrentUser when you only need the current user’s info for UI (header, etc.).
- Keep requireAuth for special cases where a route allows multiple roles (e.g., ADMIN and TRAINER) or has additional ownership checks. Middleware can be extended later with more granular matchers if needed.

Rationale:

Placing requireAuth in both the segment layout and page triggers multiple getServerSession calls per navigation, which can slightly slow down transitions. Relying on middleware for gating and calling getCurrentUser only where the user object is needed reduces redundant work while keeping behavior intact.
