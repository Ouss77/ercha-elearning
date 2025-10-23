# Agent Guidelines for ercha-elearning

> **Quick Reference**: Before creating anything new, search for existing implementations first!
> See [RULES.md](./RULES.md) for comprehensive development rules and patterns.

## Build/Lint/Test Commands
- **Build**: `bun run build` (Next.js production build)
- **Dev**: `bun run dev` (Next.js development server on port 3000)
- **Lint**: `bun run lint` (Next.js ESLint)
- **Type Check**: `bun run type-check` (TypeScript validation)
- **Start**: `bun run start` (Next.js production server)
- **DB Push**: `bun run db:push` (Drizzle schema push to database)
- **DB Seed**: `bun run db:seed` (Database seeding with initial data)
- **DB Studio**: `bun run db:studio` (Drizzle Studio for database management)
- **Deploy Check**: `bun run deploy:check` (Environment validation + build)
- **Pre-commit**: Run `bun run lint` after any changes

## Code Style Guidelines

### TypeScript & React
- Use TypeScript 5.x with strict mode enabled
- Next.js 14 with App Router
- Add `"use client"` directive for client components
- Use `@/*` path aliases for imports

### Imports Organization
```
import * as React from "react"
import { useState } from "react"
import { externalLibrary } from "package"
import { InternalComponent } from "@/components/internal"
```

### Naming Conventions
- **Components**: PascalCase (e.g., `LoginForm`, `UserDashboard`)
- **Variables/Functions**: camelCase (e.g., `userData`, `handleSubmit`)
- **Files**: kebab-case for components, camelCase for utilities
- **Database**: snake_case for columns, PascalCase for tables

### Error Handling
- Use Zod schemas for validation
- Try/catch blocks with specific error types
- Handle validation errors separately from runtime errors
- Use `z.ZodError` for schema validation errors

### Database & Types
- Drizzle ORM with PostgreSQL
- Use enums for role/status fields
- snake_case for database column names
- camelCase for TypeScript interfaces

### Styling
- Tailwind CSS with class-variance-authority for variants
- Use `cn()` utility for conditional classes
- Follow component library patterns (Radix UI + shadcn/ui)

### Security
- Never log or expose secrets/keys
- Validate all user inputs with Zod
- Use proper authentication flows

## Code Reusability & Best Practices

### Before Creating New Code
**ALWAYS check for existing implementations first:**

1. **Types & Interfaces**
   - Search in `/types/` directory for existing type definitions
   - Check component prop types and API response types
   - Use `grep_search` or `semantic_search` to find similar types
   - Extend existing types rather than duplicating

2. **Database Queries**
   - Review `/lib/db/` for existing queries
   - Check `/app/api/` routes for similar data fetching patterns
   - Reuse and compose existing Drizzle queries
   - Don't duplicate query logic across files

3. **React Hooks**
   - Search `/lib/`, `/hooks/`, and component files for custom hooks
   - Common hooks: `useAuth`, `useUser`, `useSession`, etc.
   - Extend or compose existing hooks when possible

4. **Components**
   - Check `/components/ui/` for base UI components
   - Review domain-specific folders (`/components/course/`, `/components/admin/`, etc.)
   - Look for similar functionality before creating new components
   - Reuse and compose existing components

5. **Utilities & Helpers**
   - Search `/lib/utils/` and `/lib/` for utility functions
   - Check for validation schemas in `/lib/schemas/`
   - Reuse constants from `/lib/constants/`

### Search Strategy
```bash
# MANDATORY: Before creating any new code, search using these methods:

# 1. Semantic search for concepts/functionality
semantic_search("user authentication hook")
semantic_search("course enrollment logic")

# 2. Grep search for specific patterns
grep_search("interface.*User|type.*User", isRegexp: true)
grep_search("function.*getCourse", isRegexp: true)

# 3. File search for naming patterns
file_search("**/user*.ts*")
file_search("**/*-schema.ts")

# 4. Read similar feature implementations
read_file("/lib/db/user-queries.ts")
read_file("/components/course/course-card.tsx")
```

### Code Organization
- **Colocation**: Keep related types, queries, and components together
- **Index Files**: Export reusable code from `index.ts` for cleaner imports
- **Documentation**: Add JSDoc comments for complex types and utilities
- **Barrel Exports**: Use barrel exports (`index.ts`) for public APIs
- **File Naming**: Use kebab-case for files, PascalCase for component files

## AI Agent Workflow

### Step-by-Step Process
1. **Understand the Task**: Parse user request and identify required changes
2. **Search First**: Use semantic/grep/file search to find existing implementations
3. **Read Context**: Read relevant files to understand current patterns
4. **Plan Changes**: Identify files to create/modify
5. **Implement**: Make changes following project conventions
6. **Validate**: Run `bun run lint` and check for errors
7. **Document**: Update relevant docs if needed

### Decision Tree
```
New feature request?
├─ Yes → Search for similar existing features first
│        ├─ Found? → Extend/compose existing code
│        └─ Not found? → Create new following patterns
└─ Bug fix/modification?
   └─ Read context → Understand issue → Fix → Validate
```

## Copilot Instructions
- **Search First**: ALWAYS search for existing code before creating new implementations
- **Follow Conventions**: Use standard TypeScript/Next.js/Drizzle patterns
- **Validate Changes**: Run `bun run lint` after all modifications
- **Composition over Duplication**: Prefer extending/composing existing code
- **DRY Principle**: Don't Repeat Yourself - reuse existing utilities
- **Type Safety**: Leverage TypeScript strict mode, avoid `any`
- **Error Handling**: Use try/catch with Zod validation
- **Security First**: Never log secrets, validate all inputs
