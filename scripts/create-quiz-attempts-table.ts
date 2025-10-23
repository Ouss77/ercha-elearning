import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function createQuizAttemptsTable() {
  console.log("🚀 Creating quiz_attempts table...");

  try {
    // Create the quiz_attempts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "quiz_attempts" (
        "id" SERIAL PRIMARY KEY,
        "student_id" INTEGER REFERENCES "users"("id"),
        "quiz_id" INTEGER REFERENCES "content_items"("id"),
        "answers" JSONB NOT NULL,
        "score" INTEGER NOT NULL,
        "passed" BOOLEAN NOT NULL,
        "attempted_at" TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Table quiz_attempts created successfully!");

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "quiz_attempts_student_id_idx" ON "quiz_attempts"("student_id");
    `);
    console.log("✅ Index on student_id created");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "quiz_attempts_quiz_id_idx" ON "quiz_attempts"("quiz_id");
    `);
    console.log("✅ Index on quiz_id created");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "quiz_attempts_passed_idx" ON "quiz_attempts"("passed");
    `);
    console.log("✅ Index on passed created");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error creating table:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
createQuizAttemptsTable()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
