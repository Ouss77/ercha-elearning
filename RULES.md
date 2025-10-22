# Development Rules for ercha-elearning

> **Core Principle**: Search before you create. Reuse before you rebuild.

## 🔍 Golden Rules

### 1. **NEVER Create Before Searching**
Before writing ANY new code:
- ✅ Search for existing types, interfaces, components, hooks, queries
- ✅ Read similar feature implementations
- ✅ Check for reusable utilities and helpers
- ❌ Don't duplicate existing functionality
- ❌ Don't assume something doesn't exist

### 2. **Type Safety is Non-Negotiable**
- ✅ Use TypeScript strict mode
- ✅ Define explicit types for all props, parameters, and returns
- ✅ Use Zod schemas for runtime validation
- ❌ Never use `any` type (use `unknown` if necessary)
- ❌ Don't bypass type checking with `@ts-ignore`

### 3. **Database Interactions**
- ✅ Use Drizzle ORM for all database queries
- ✅ snake_case for database columns
- ✅ Use transactions for multi-step operations
- ✅ Validate input with Zod before database operations
- ❌ Never write raw SQL unless absolutely necessary
- ❌ Don't expose sensitive data in API responses

### 4. **Component Architecture**
- ✅ Use "use client" directive for client components
- ✅ Keep components small and focused (Single Responsibility)
- ✅ Compose components from smaller reusable pieces
- ✅ Use shadcn/ui components as base building blocks
- ❌ Don't create monolithic components
- ❌ Don't mix server and client logic without clear boundaries

### 5. **State Management**
- ✅ Use React hooks for local state
- ✅ Use context for shared state (auth, theme)
- ✅ Server components for data fetching when possible
- ✅ Optimize re-renders with useMemo/useCallback
- ❌ Don't prop-drill beyond 2-3 levels
- ❌ Don't use client-side state for server data unnecessarily

## 📁 File Organization Rules

### Directory Structure
```
/app                  → Next.js App Router pages & API routes
/components          → Reusable React components
  /ui                → Base UI components (shadcn/ui)
  /[domain]          → Domain-specific components
/lib                 → Utilities, helpers, configurations
  /db                → Database queries and utilities
  /schemas           → Zod validation schemas
  /utils             → Helper functions
  /auth              → Authentication utilities
/types               → TypeScript type definitions
/drizzle             → Database schema and migrations
/public              → Static assets
```

### File Naming Conventions
- **Components**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Types**: `kebab-case.ts` (e.g., `user-types.ts`)
- **API Routes**: `route.ts` (Next.js convention)
- **Schemas**: `kebab-case-schema.ts` (e.g., `user-schema.ts`)

## 🎨 Code Style Rules

### Imports Order
```typescript
// 1. React imports
import * as React from "react"
import { useState, useEffect } from "react"

// 2. External libraries
import { z } from "zod"
import { eq } from "drizzle-orm"

// 3. Internal components
import { Button } from "@/components/ui/button"

// 4. Internal utilities/types
import { formatDate } from "@/lib/utils/date"
import type { User } from "@/types/user"

// 5. Relative imports (if any)
import { localHelper } from "./helpers"
```

### Function Definitions
```typescript
// ✅ Good: Arrow functions for React components
export const UserCard = ({ user }: UserCardProps) => {
  return <div>{user.name}</div>
}

// ✅ Good: Named functions for utilities
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Good: Async/await for async operations
async function fetchUser(id: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id)
  })
  if (!user) throw new Error("User not found")
  return user
}
```

### Error Handling Patterns
```typescript
// ✅ Good: Specific error handling
try {
  const data = schema.parse(input)
  await saveToDatabase(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    return { error: "Validation failed", details: error.errors }
  }
  if (error instanceof DatabaseError) {
    return { error: "Database operation failed" }
  }
  throw error // Re-throw unexpected errors
}

// ❌ Bad: Generic error handling
try {
  await doSomething()
} catch (error) {
  console.log(error) // Too generic
}
```

## 🔐 Security Rules

### Authentication & Authorization
- ✅ Use next-auth for authentication
- ✅ Check user roles/permissions server-side
- ✅ Validate session in API routes
- ✅ Use middleware for route protection
- ❌ Never trust client-side role checks
- ❌ Don't expose user tokens or secrets

### Input Validation
- ✅ Validate ALL user inputs with Zod
- ✅ Sanitize data before database insertion
- ✅ Use parameterized queries (Drizzle handles this)
- ❌ Never trust frontend validation alone
- ❌ Don't interpolate user input into queries

### Environment Variables
```typescript
// ✅ Good: Validate env vars on startup
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
})

export const env = envSchema.parse(process.env)

// ❌ Bad: Direct process.env access
const dbUrl = process.env.DATABASE_URL // Might be undefined
```

## 🧪 Testing & Validation Rules

### Before Committing
1. ✅ Run `bun run lint` - Fix all linting errors
2. ✅ Check for TypeScript errors in IDE
3. ✅ Test the feature manually in dev mode
4. ✅ Verify database migrations work if schema changed
5. ✅ Check console for warnings/errors

### Code Quality Checklist
- [ ] No `console.log` statements (use proper logging)
- [ ] No `any` types
- [ ] All imports are used
- [ ] No unused variables
- [ ] Proper error handling in place
- [ ] Types are properly exported/imported
- [ ] Components have proper prop types
- [ ] API routes validate input
- [ ] Database queries use proper types

## 🚀 Performance Rules

### React Performance
- ✅ Use Server Components by default
- ✅ Add "use client" only when needed (interactivity, hooks)
- ✅ Memoize expensive calculations with useMemo
- ✅ Memoize callbacks passed to child components with useCallback
- ✅ Use dynamic imports for large components
- ❌ Don't make entire app client-side
- ❌ Don't fetch data client-side when server-side is possible

### Database Performance
- ✅ Use database indexes for frequently queried columns
- ✅ Limit query results with `.limit()`
- ✅ Select only needed columns
- ✅ Use pagination for large datasets
- ❌ Don't fetch all records without limit
- ❌ Don't run queries in loops (use batch operations)

## 📝 Documentation Rules

### Code Comments
```typescript
// ✅ Good: Explain WHY, not WHAT
// Using setTimeout to debounce rapid API calls and prevent rate limiting
const debouncedSearch = debounce(search, 300)

// ❌ Bad: Obvious comments
// Set the name variable to user.name
const name = user.name
```

### JSDoc for Complex Functions
```typescript
/**
 * Calculates the user's progress through a course
 * @param userId - The ID of the user
 * @param courseId - The ID of the course
 * @returns Progress percentage (0-100)
 * @throws {NotFoundError} If user or course doesn't exist
 */
export async function calculateCourseProgress(
  userId: string,
  courseId: string
): Promise<number> {
  // Implementation
}
```

## 🔄 Git & Version Control Rules

### Commit Messages
```bash
# ✅ Good: Clear, descriptive commits
git commit -m "feat: add user profile edit functionality"
git commit -m "fix: resolve course enrollment race condition"
git commit -m "refactor: extract user validation into separate schema"
git commit -m "docs: update API documentation for enrollment endpoints"

# ❌ Bad: Vague commits
git commit -m "fixes"
git commit -m "update stuff"
git commit -m "wip"
```

### Branch Naming
- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Code refactoring
- `docs/what-documented` - Documentation updates

## 🎯 API Route Rules

### Structure
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Validate input
    const { id } = params

    // 3. Fetch data
    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // 4. Return response
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## 🎨 UI/UX Rules

### Styling
- ✅ Use Tailwind utility classes
- ✅ Use `cn()` utility for conditional classes
- ✅ Use CSS variables for theme colors
- ✅ Follow mobile-first responsive design
- ❌ Don't use inline styles
- ❌ Don't use arbitrary values extensively (use theme)

### Accessibility
- ✅ Use semantic HTML elements
- ✅ Add proper ARIA labels
- ✅ Ensure keyboard navigation works
- ✅ Use sufficient color contrast
- ❌ Don't use div/span for interactive elements
- ❌ Don't forget alt text for images

## 🔧 Debugging Rules

### Development Tools
- ✅ Use React DevTools for component debugging
- ✅ Use Drizzle Studio for database inspection
- ✅ Use browser DevTools for network/console
- ✅ Use TypeScript language server errors
- ❌ Don't leave `console.log` in production code
- ❌ Don't ignore TypeScript errors

### Error Messages
```typescript
// ✅ Good: Descriptive error messages
throw new Error(`User with ID ${userId} not found in database`)
throw new Error(`Invalid email format: ${email}`)

// ❌ Bad: Generic error messages
throw new Error("Error")
throw new Error("Something went wrong")
```

---

## 📚 Quick Reference

### Common Patterns
- **Server Component**: No "use client", async, fetch data directly
- **Client Component**: "use client", hooks, interactivity
- **API Route**: Validate → Authenticate → Process → Return
- **Database Query**: Import from `/lib/db`, use Drizzle, handle errors
- **Form**: Zod schema → React Hook Form → Server action/API

### When in Doubt
1. Search existing codebase for similar patterns
2. Check [AGENTS.md](./AGENTS.md) for quick guidelines
3. Follow Next.js/TypeScript/Drizzle best practices
4. Prioritize type safety and validation
5. Ask for clarification if requirements are unclear

---

**Remember**: Good code is code that's easy to understand, maintain, and extend. When in doubt, choose clarity over cleverness.
