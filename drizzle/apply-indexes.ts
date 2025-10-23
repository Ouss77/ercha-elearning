import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { sql } from "drizzle-orm"
import { readFileSync } from "fs"
import { join } from "path"

async function applyIndexes() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables")
  }

  console.log("🔄 Applying performance indexes...")

  const pool = new Pool({
    connectionString,
  })

  const db = drizzle(pool)

  try {
    // Read the migration file
    const migrationPath = join(__dirname, "migrations", "0007_add_performance_indexes.sql")
    const migrationSQL = readFileSync(migrationPath, "utf-8")

    // Extract CREATE INDEX statements (ignore comments)
    const lines = migrationSQL.split("\n")
    const statements: string[] = []
    let currentStatement = ""

    for (const line of lines) {
      const trimmed = line.trim()
      
      // Skip empty lines and comment-only lines
      if (!trimmed || trimmed.startsWith("--")) {
        continue
      }

      // Add line to current statement
      currentStatement += " " + trimmed

      // If line ends with semicolon, we have a complete statement
      if (trimmed.endsWith(";")) {
        statements.push(currentStatement.trim())
        currentStatement = ""
      }
    }

    console.log(`📝 Found ${statements.length} index creation statements\n`)

    let created = 0
    let skipped = 0

    for (const statement of statements) {
      try {
        await pool.query(statement)
        const indexName = statement.match(/idx_\w+/)?.[0] || "unknown"
        console.log(`  ✅ Created: ${indexName}`)
        created++
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === "42P07" || error.message?.includes("already exists")) {
          const indexName = statement.match(/idx_\w+/)?.[0] || "unknown"
          console.log(`  ⏭️  Exists: ${indexName}`)
          skipped++
        } else {
          const indexName = statement.match(/idx_\w+/)?.[0] || "unknown"
          console.error(`  ❌ Failed: ${indexName}`)
          console.error(`     Error: ${error.message}`)
          throw error
        }
      }
    }

    console.log(`\n✅ Indexes applied: ${created} created, ${skipped} already existed`)
  } catch (error) {
    console.error("\n❌ Failed to apply indexes:", error)
    throw error
  } finally {
    await pool.end()
  }
}

applyIndexes()
  .then(() => {
    console.log("✨ Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
