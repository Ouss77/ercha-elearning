# Agent Guidelines for ercha-elearning

## Build/Lint/Test Commands
- **Build**: `bun run build` (Next.js production build)
- **Dev**: `bun run dev` (Next.js development server)
- **Lint**: `bun run lint` (Next.js ESLint)
- **Start**: `bun run start` (Next.js production server)
- **DB Push**: `bun run db:push` (Drizzle schema push)
- **DB Seed**: `bun run db:seed` (Database seeding)
- **Deploy Check**: `bun run deploy:check` (Environment validation + build)
- **Single Test**: No test framework configured - run lint after changes

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

## Copilot Instructions
- Follow standard TypeScript/Next.js conventions
- Run `bun test && bun run lint` after changes (adapt to available scripts)