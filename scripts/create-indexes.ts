/**
 * Create Database Indexes
 * 
 * Creates performance indexes for modules and chapters tables.
 * Run this script after migration to optimize query performance.
 */

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const indexes = [
  {
    name: "idx_modules_course_id_order",
    table: "modules",
    columns: ["course_id", "order_index"],
    description: "Optimize module queries by course with ordering",
  },
  {
    name: "idx_chapters_module_id_order",
    table: "chapters",
    columns: ["module_id", "order_index"],
    description: "Optimize chapter queries by module with ordering",
  },
  {
    name: "idx_content_items_chapter_id",
    table: "content_items",
    columns: ["chapter_id"],
    description: "Optimize content item lookups by chapter",
  },
  {
    name: "idx_chapter_progress_student_chapter",
    table: "chapter_progress",
    columns: ["student_id", "chapter_id"],
    description: "Optimize progress queries by student and chapter",
  },
  {
    name: "idx_enrollments_student_course",
    table: "enrollments",
    columns: ["student_id", "course_id"],
    description: "Optimize enrollment lookups",
  },
];

async function createIndexes() {
  console.log("🔧 Creating database indexes...\n");

  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected\n");

    for (const index of indexes) {
      const { name, table, columns, description } = index;
      
      try {
        // Check if index already exists
        const checkResult = await pool.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = $1
        `, [name]);

        if (checkResult.rows.length > 0) {
          console.log(`⏭️  Index '${name}' already exists - skipping`);
          continue;
        }

        // Create index
        const columnList = columns.join(", ");
        const createSQL = `CREATE INDEX IF NOT EXISTS ${name} ON ${table}(${columnList})`;
        
        console.log(`📝 Creating: ${name}`);
        console.log(`   Table: ${table}`);
        console.log(`   Columns: ${columnList}`);
        console.log(`   Purpose: ${description}`);
        
        await pool.query(createSQL);
        console.log(`   ✅ Created successfully\n`);
      } catch (error) {
        console.error(`   ❌ Failed to create index '${name}':`, error);
        console.log("");
      }
    }

    // Verify all indexes
    console.log("=" .repeat(60));
    console.log("\n🔍 Verifying indexes...\n");

    const result = await pool.query(`
      SELECT 
        indexname,
        tablename
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `);

    console.log(`Found ${result.rows.length} indexes:\n`);
    
    const byTable: Record<string, string[]> = {};
    result.rows.forEach((row) => {
      if (!byTable[row.tablename]) {
        byTable[row.tablename] = [];
      }
      byTable[row.tablename].push(row.indexname);
    });

    for (const [table, indexNames] of Object.entries(byTable)) {
      console.log(`📊 ${table}:`);
      indexNames.forEach((name) => {
        console.log(`   - ${name}`);
      });
      console.log("");
    }

    console.log("✅ Index creation completed!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
createIndexes();
