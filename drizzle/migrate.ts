import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"

async function runMigration() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables")
  }

  console.log("🔄 Starting database migration...")

  const pool = new Pool({
    connectionString,
  })

  const db = drizzle(pool)

  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" })
    console.log("✅ Migration completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    await pool.end()
  }
}

runMigration()
  .then(() => {
    console.log("✨ All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
