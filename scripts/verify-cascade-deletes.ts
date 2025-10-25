/**
 * Cascade Delete Verification Script
 * 
 * Creates test data and verifies cascade delete behavior works correctly.
 * Tests:
 * - Deleting a module cascades to chapters
 * - Deleting a course cascades to modules and chapters
 * 
 * WARNING: This script creates and deletes test data. Do NOT run on production!
 */

import { db } from "@/lib/db";
import { modules, chapters, courses } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

async function verifyCascadeDeletes() {
  console.log("🧪 Testing Cascade Delete Behavior...\n");
  console.log("⚠️  This script will create and delete test data");
  console.log("⚠️  Ensure you are NOT running this on production!\n");

  try {
    // Test 1: Module deletion cascades to chapters
    console.log("📝 Test 1: Module deletion → chapters deleted");
    
    // Create test course
    const [testCourse] = await db
      .insert(courses)
      .values({
        title: "TEST_CASCADE_COURSE",
        slug: "test-cascade-course",
        description: "Temporary test course",
        isActive: false,
      })
      .returning();
    
    console.log(`   ✓ Created test course (ID: ${testCourse.id})`);

    // Create test module
    const [testModule] = await db
      .insert(modules)
      .values({
        courseId: testCourse.id,
        title: "TEST_MODULE",
        description: "Temporary test module",
        orderIndex: 0,
      })
      .returning();
    
    console.log(`   ✓ Created test module (ID: ${testModule.id})`);

    // Create test chapters
    const testChapters = await db
      .insert(chapters)
      .values([
        {
          moduleId: testModule.id,
          title: "TEST_CHAPTER_1",
          orderIndex: 0,
        },
        {
          moduleId: testModule.id,
          title: "TEST_CHAPTER_2",
          orderIndex: 1,
        },
      ])
      .returning();
    
    console.log(`   ✓ Created ${testChapters.length} test chapters`);

    // Verify chapters exist
    const chaptersBefore = await db
      .select()
      .from(chapters)
      .where(eq(chapters.moduleId, testModule.id));
    
    console.log(`   ✓ Verified ${chaptersBefore.length} chapters before delete`);

    // Delete module
    await db.delete(modules).where(eq(modules.id, testModule.id));
    console.log(`   ✓ Deleted test module`);

    // Verify chapters are deleted (cascade)
    const chaptersAfter = await db
      .select()
      .from(chapters)
      .where(eq(chapters.moduleId, testModule.id));
    
    if (chaptersAfter.length === 0) {
      console.log("   ✅ Test 1 PASSED: Chapters cascade deleted with module\n");
    } else {
      console.log(`   ❌ Test 1 FAILED: ${chaptersAfter.length} orphaned chapters remain\n`);
      // Cleanup
      await db.delete(courses).where(eq(courses.id, testCourse.id));
      process.exit(1);
    }

    // Test 2: Course deletion cascades to modules and chapters
    console.log("📝 Test 2: Course deletion → modules + chapters deleted");

    // Create test module for existing test course
    const [testModule2] = await db
      .insert(modules)
      .values({
        courseId: testCourse.id,
        title: "TEST_MODULE_2",
        description: "Temporary test module 2",
        orderIndex: 0,
      })
      .returning();
    
    console.log(`   ✓ Created test module (ID: ${testModule2.id})`);

    // Create test chapters
    const testChapters2 = await db
      .insert(chapters)
      .values([
        {
          moduleId: testModule2.id,
          title: "TEST_CHAPTER_3",
          orderIndex: 0,
        },
      ])
      .returning();
    
    console.log(`   ✓ Created ${testChapters2.length} test chapter`);

    // Verify data exists
    const modulesBefore = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, testCourse.id));
    
    const chaptersBeforeCourse = await db
      .select()
      .from(chapters)
      .where(eq(chapters.moduleId, testModule2.id));
    
    console.log(`   ✓ Verified ${modulesBefore.length} modules before delete`);
    console.log(`   ✓ Verified ${chaptersBeforeCourse.length} chapters before delete`);

    // Delete course
    await db.delete(courses).where(eq(courses.id, testCourse.id));
    console.log(`   ✓ Deleted test course`);

    // Verify modules are deleted
    const modulesAfter = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, testCourse.id));
    
    // Verify chapters are deleted
    const chaptersAfterCourse = await db
      .select()
      .from(chapters)
      .where(eq(chapters.moduleId, testModule2.id));
    
    if (modulesAfter.length === 0 && chaptersAfterCourse.length === 0) {
      console.log("   ✅ Test 2 PASSED: Modules and chapters cascade deleted with course\n");
    } else {
      console.log(`   ❌ Test 2 FAILED: ${modulesAfter.length} orphaned modules, ${chaptersAfterCourse.length} orphaned chapters\n`);
      process.exit(1);
    }

    console.log("=" .repeat(60));
    console.log("\n✅ All cascade delete tests passed!");
    console.log("✅ Database constraints are working correctly.\n");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    console.log("\n⚠️  Attempting cleanup...");
    
    try {
      // Try to cleanup test data
      await db.execute(sql`
        DELETE FROM ${courses}
        WHERE title = 'TEST_CASCADE_COURSE'
      `);
      console.log("✓ Cleanup successful");
    } catch (cleanupError) {
      console.error("✗ Cleanup failed:", cleanupError);
    }
    
    process.exit(1);
  }
}

// Run
verifyCascadeDeletes();
