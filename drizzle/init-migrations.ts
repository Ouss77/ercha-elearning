import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { readdir } from "fs/promises"
import { join } from "path"

async function initMigrationTracking() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables")
  }

  console.log("🔄 Initializing migration tracking...")

  const pool = new Pool({
    connectionString,
  })

  try {
    // Create the migration tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `)

    // Check if migrations are already tracked
    const existingMigrations = await pool.query(
      "SELECT hash FROM __drizzle_migrations"
    )

    if (existingMigrations.rows.length > 0) {
      console.log(`✅ Migration tracking already initialized with ${existingMigrations.rows.length} migrations`)
      return
    }

    // Get all migration files from meta/_journal.json
    const journalPath = join(process.cwd(), "drizzle/migrations/meta/_journal.json")
    const journal = await import(journalPath)
    
    // Mark all migrations as applied
    for (const entry of journal.default.entries) {
      await pool.query(
        "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)",
        [entry.tag, entry.when]
      )
      console.log(`✅ Marked migration as applied: ${entry.tag}`)
    }

    console.log("✅ Migration tracking initialized successfully!")
  } catch (error) {
    console.error("❌ Failed to initialize migration tracking:", error)
    throw error
  } finally {
    await pool.end()
  }
}

initMigrationTracking()
  .then(() => {
    console.log("✨ All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
