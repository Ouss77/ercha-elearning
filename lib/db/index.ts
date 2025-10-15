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

// Helper function to handle database errors
export function handleDbError(error: unknown) {
  console.error("Database error:", error)

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: false,
    error: "An unknown database error occurred",
  }
}
