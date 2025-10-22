import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "@/drizzle/schema"

// Get database URL from environment variable
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("DATABASE_URL not found in environment variables")
  }

  return url
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: getDatabaseUrl(),
})

// Create Drizzle client
export const db = drizzle(pool, { schema })

// ============================================================================
// FOUNDATIONAL UTILITIES
// ============================================================================
// Export new foundational types and utilities
export * from './types';
export * from './error-handler';
export * from './validation';
export * from './base-queries';
export * from './transactions';
export * from './query-builders';

// ============================================================================
// DATA MAPPERS
// ============================================================================
// Export data mapping utilities for backward compatibility
export * from './mappers';

// ============================================================================
// DOMAIN-SPECIFIC QUERY MODULES
// ============================================================================
// Export all refactored query modules
export * from './user-queries';
export * from './course-queries';
export * from './enrollment-queries';
export * from './domain-queries';
export * from './chapter-queries';
export * from './progress-queries';
export * from './project-queries';
export * from './class-queries';
export * from './queries';

// ============================================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// ============================================================================
// Export performance optimization utilities
export * from './cache';
export * from './pagination';
export * from './profiler';

// ============================================================================
// DEPRECATED FUNCTIONS
// ============================================================================
/**
 * @deprecated Use handleDbError from './error-handler' instead
 * This function will be removed in a future version.
 * 
 * Migration guide:
 * ```typescript
 * // Old way:
 * import { handleDbError } from '@/lib/db';
 * 
 * // New way:
 * import { handleDbError } from '@/lib/db/error-handler';
 * // or
 * import { handleDbError } from '@/lib/db';
 * ```
 */
export function handleDbError(error: unknown) {
  console.error("Database error:", error)
  
  if (error instanceof Error) {
    console.error("Error stack:", error.stack)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return {
      success: false as const,
      error: error.message,
    }
  }

  return {
    success: false as const,
    error: "An unknown database error occurred",
  }
}
