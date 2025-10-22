import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function verifyTable() {
  console.log("🔍 Verifying quiz_attempts table...\n");

  try {
    // Check if table exists and get structure
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quiz_attempts'
      ORDER BY ordinal_position;
    `);

    if (result.rows.length === 0) {
      console.log("❌ Table quiz_attempts does not exist!");
    } else {
      console.log(
        "✅ Table quiz_attempts exists with the following structure:\n"
      );
      console.log("Column Name          | Data Type              | Nullable");
      console.log("---------------------|------------------------|----------");
      result.rows.forEach((row: any) => {
        console.log(
          `${row.column_name.padEnd(20)} | ${row.data_type.padEnd(22)} | ${
            row.is_nullable
          }`
        );
      });

      // Check indexes
      const indexes = await db.execute(sql`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'quiz_attempts';
      `);

      console.log("\n📊 Indexes:");
      indexes.rows.forEach((row: any) => {
        console.log(`  - ${row.indexname}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

verifyTable();
