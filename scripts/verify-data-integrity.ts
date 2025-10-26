/**
 * Data Integrity Verification Script
 * 
 * Verifies the integrity of the modular course structure after migration.
 * Checks for orphaned records and validates relationships.
 */

import { db } from "@/lib/db";
import { modules, chapters, courses, chapterProgress } from "@/drizzle/schema";
import { sql } from "drizzle-orm";

interface IntegrityCheck {
  name: string;
  query: () => Promise<number>;
  expected: number;
  description: string;
}

const checks: IntegrityCheck[] = [
  {
    name: "Orphaned Chapters",
    description: "Chapters without valid module references",
    expected: 0,
    query: async () => {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM ${chapters}
        WHERE module_id NOT IN (SELECT id FROM ${modules})
      `);
      return Number(result.rows[0]?.count || 0);
    },
  },
  {
    name: "Orphaned Modules",
    description: "Modules without valid course references",
    expected: 0,
    query: async () => {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM ${modules}
        WHERE course_id NOT IN (SELECT id FROM ${courses})
      `);
      return Number(result.rows[0]?.count || 0);
    },
  },
  {
    name: "Orphaned Chapter Progress",
    description: "Progress records without valid chapter references",
    expected: 0,
    query: async () => {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM ${chapterProgress}
        WHERE chapter_id NOT IN (SELECT id FROM ${chapters})
      `);
      return Number(result.rows[0]?.count || 0);
    },
  },
  {
    name: "Chapters with NULL moduleId",
    description: "Chapters that haven't been migrated to modules",
    expected: 0,
    query: async () => {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM ${chapters}
        WHERE module_id IS NULL
      `);
      return Number(result.rows[0]?.count || 0);
    },
  },
  {
    name: "Modules with NULL courseId",
    description: "Modules without course association",
    expected: 0,
    query: async () => {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM ${modules}
        WHERE course_id IS NULL
      `);
      return Number(result.rows[0]?.count || 0);
    },
  },
];

async function runIntegrityChecks() {
  console.log("🔍 Running Data Integrity Checks...\n");
  
  let passCount = 0;
  let failCount = 0;
  const failures: { name: string; actual: number; expected: number }[] = [];

  for (const check of checks) {
    try {
      const result = await check.query();
      const passed = result === check.expected;
      
      const status = passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} | ${check.name}`);
      console.log(`   Description: ${check.description}`);
      console.log(`   Expected: ${check.expected} | Actual: ${result}`);
      
      if (passed) {
        passCount++;
      } else {
        failCount++;
        failures.push({
          name: check.name,
          actual: result,
          expected: check.expected,
        });
      }
      console.log("");
    } catch (error) {
      console.error(`❌ ERROR | ${check.name}`);
      console.error(`   ${error}`);
      console.log("");
      failCount++;
      failures.push({
        name: check.name,
        actual: -1,
        expected: check.expected,
      });
    }
  }

  // Summary
  console.log("=" .repeat(60));
  console.log(`\n📊 Summary: ${passCount}/${checks.length} checks passed\n`);
  
  if (failCount > 0) {
    console.log("⚠️  FAILED CHECKS:");
    failures.forEach((f) => {
      console.log(`   - ${f.name}: Expected ${f.expected}, got ${f.actual}`);
    });
    console.log("\n❌ Data integrity issues detected!");
    process.exit(1);
  } else {
    console.log("✅ All integrity checks passed!");
    console.log("✅ Database is in a healthy state.\n");
    process.exit(0);
  }
}

// Additional Stats
async function printStats() {
  console.log("\n📈 Database Statistics:");
  
  try {
    const courseCount = await db.execute(sql`SELECT COUNT(*) as count FROM ${courses}`);
    const moduleCount = await db.execute(sql`SELECT COUNT(*) as count FROM ${modules}`);
    const chapterCount = await db.execute(sql`SELECT COUNT(*) as count FROM ${chapters}`);
    const progressCount = await db.execute(sql`SELECT COUNT(*) as count FROM ${chapterProgress}`);
    
    console.log(`   Courses: ${courseCount.rows[0]?.count || 0}`);
    console.log(`   Modules: ${moduleCount.rows[0]?.count || 0}`);
    console.log(`   Chapters: ${chapterCount.rows[0]?.count || 0}`);
    console.log(`   Progress Records: ${progressCount.rows[0]?.count || 0}`);
    console.log("");
  } catch (error) {
    console.error("   Error fetching stats:", error);
  }
}

// Run
(async () => {
  await printStats();
  await runIntegrityChecks();
})();
