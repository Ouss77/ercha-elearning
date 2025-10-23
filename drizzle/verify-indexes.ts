import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { sql } from "drizzle-orm"

async function verifyIndexes() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables")
  }

  console.log("🔍 Verifying performance indexes...\n")

  const pool = new Pool({
    connectionString,
  })

  const db = drizzle(pool)

  try {
    // Query to get all indexes we created
    const result = await db.execute<{
      tablename: string
      indexname: string
      indexdef: string
    }>(sql`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `)

    const indexesByTable = new Map<string, string[]>()

    for (const row of result.rows) {
      if (!indexesByTable.has(row.tablename)) {
        indexesByTable.set(row.tablename, [])
      }
      indexesByTable.get(row.tablename)!.push(row.indexname)
    }

    if (result.rows.length === 0) {
      console.log("⚠️  No indexes found with 'idx_' prefix")
      console.log("\nTrying to list all indexes...")
      
      const allIndexes = await db.execute(sql`
        SELECT tablename, indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `)
      
      console.log(`\nFound ${allIndexes.rows.length} total indexes in public schema`)
      return
    }

    console.log("📊 Indexes by table:\n")

    for (const [table, indexes] of Array.from(indexesByTable.entries()).sort()) {
      console.log(`  ${table} (${indexes.length} indexes):`)
      for (const index of indexes.sort()) {
        console.log(`    ✓ ${index}`)
      }
      console.log()
    }

    console.log(`✅ Total performance indexes found: ${result.rows.length}`)
  } catch (error) {
    console.error("❌ Failed to verify indexes:", error)
    throw error
  } finally {
    await pool.end()
  }
}

verifyIndexes()
  .then(() => {
    console.log("\n✨ Verification complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
