#!/usr/bin/env bun
/**
 * Migration Script: Modules Layer
 * 
 * This script migrates existing course structure to the new modular structure:
 * - Creates a default module for each course with chapters
 * - Associates all chapters with their course's default module
 * - Validates data integrity before and after migration
 * 
 * Run with: bun run scripts/migrate-to-modules.ts
 */

import { db } from "@/lib/db"
import { courses, chapters, modules } from "@/drizzle/schema"
import { eq, isNull, isNotNull, sql } from "drizzle-orm"

interface MigrationStats {
  coursesProcessed: number
  modulesCreated: number
  chaptersUpdated: number
  errors: string[]
}

/**
 * Pre-migration validation checks
 */
async function validatePreMigration(): Promise<boolean> {
  console.log("\n📋 Running pre-migration validation checks...")
  
  try {
    // Check 1: All chapters must reference valid courses
    const orphanedChapters = await db
      .select({ id: chapters.id, courseId: chapters.courseId })
      .from(chapters)
      .leftJoin(courses, eq(chapters.courseId, courses.id))
      .where(isNull(courses.id))
    
    if (orphanedChapters.length > 0) {
      console.error(`❌ Found ${orphanedChapters.length} orphaned chapters (invalid courseId)`)
      console.error("Orphaned chapter IDs:", orphanedChapters.map(c => c.id).join(", "))
      return false
    }
    
    // Check 2: All chapters should NOT have moduleId yet
    const chaptersWithModule = await db
      .select({ count: sql<number>`count(*)` })
      .from(chapters)
      .where(isNotNull(chapters.moduleId))
    
    const count = Number(chaptersWithModule[0]?.count || 0)
    if (count > 0) {
      console.warn(`⚠️  Warning: ${count} chapters already have moduleId assigned`)
      console.log("These chapters may have been migrated previously or manually assigned")
    }
    
    // Check 3: Get statistics
    const totalCourses = await db.select({ count: sql<number>`count(*)` }).from(courses)
    const totalChapters = await db.select({ count: sql<number>`count(*)` }).from(chapters)
    
    console.log(`✅ Pre-migration checks passed:`)
    console.log(`   - Total courses: ${totalCourses[0]?.count || 0}`)
    console.log(`   - Total chapters: ${totalChapters[0]?.count || 0}`)
    console.log(`   - Chapters already migrated: ${count}`)
    console.log(`   - No orphaned chapters found`)
    
    return true
  } catch (error) {
    console.error("❌ Pre-migration validation failed:", error)
    return false
  }
}

/**
 * Main migration function
 */
async function migrateToModules(): Promise<MigrationStats> {
  console.log("\n🚀 Starting migration to modular structure...")
  
  const stats: MigrationStats = {
    coursesProcessed: 0,
    modulesCreated: 0,
    chaptersUpdated: 0,
    errors: []
  }
  
  try {
    // Get all courses
    const allCourses = await db.select().from(courses).orderBy(courses.id)
    console.log(`\nFound ${allCourses.length} courses to process`)
    
    for (const course of allCourses) {
      console.log(`\n📚 Processing course: "${course.title}" (ID: ${course.id})`)
      
      try {
        // Get chapters for this course that haven't been migrated yet
        const courseChapters = await db
          .select()
          .from(chapters)
          .where(eq(chapters.courseId, course.id))
          .orderBy(chapters.orderIndex)
        
        if (courseChapters.length === 0) {
          console.log(`   ℹ️  No chapters found, skipping`)
          stats.coursesProcessed++
          continue
        }
        
        // Check if any chapters already have moduleId
        const unmigrated = courseChapters.filter(c => c.moduleId === null)
        const migrated = courseChapters.filter(c => c.moduleId !== null)
        
        if (unmigrated.length === 0) {
          console.log(`   ✅ All ${courseChapters.length} chapters already migrated, skipping`)
          stats.coursesProcessed++
          continue
        }
        
        if (migrated.length > 0) {
          console.log(`   ⚠️  ${migrated.length} chapters already migrated, processing ${unmigrated.length} remaining`)
        }
        
        // Create default module for this course
        const [newModule] = await db
          .insert(modules)
          .values({
            courseId: course.id,
            title: "Main Content",
            description: "Migrated from original course structure",
            orderIndex: 0
          })
          .returning()
        
        console.log(`   ✅ Created module: "${newModule.title}" (ID: ${newModule.id})`)
        stats.modulesCreated++
        
        // Update all unmigrated chapters to reference the new module
        const updateResult = await db
          .update(chapters)
          .set({ 
            moduleId: newModule.id,
            updatedAt: new Date()
          })
          .where(eq(chapters.courseId, course.id))
          .returning({ id: chapters.id })
        
        console.log(`   ✅ Associated ${updateResult.length} chapters with module`)
        stats.chaptersUpdated += updateResult.length
        stats.coursesProcessed++
        
      } catch (error) {
        const errorMsg = `Failed to process course ${course.id} (${course.title}): ${error}`
        console.error(`   ❌ ${errorMsg}`)
        stats.errors.push(errorMsg)
      }
    }
    
    return stats
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

/**
 * Post-migration validation checks
 */
async function validatePostMigration(): Promise<boolean> {
  console.log("\n📋 Running post-migration validation checks...")
  
  try {
    // Check 1: All chapters should have moduleId
    const chaptersWithoutModule = await db
      .select({ count: sql<number>`count(*)` })
      .from(chapters)
      .where(isNull(chapters.moduleId))
    
    const count = Number(chaptersWithoutModule[0]?.count || 0)
    if (count > 0) {
      console.error(`❌ Found ${count} chapters without moduleId`)
      return false
    }
    
    // Check 2: All modules should reference valid courses
    const orphanedModules = await db
      .select({ id: modules.id, courseId: modules.courseId })
      .from(modules)
      .leftJoin(courses, eq(modules.courseId, courses.id))
      .where(isNull(courses.id))
    
    if (orphanedModules.length > 0) {
      console.error(`❌ Found ${orphanedModules.length} orphaned modules (invalid courseId)`)
      return false
    }
    
    // Check 3: All chapters should reference valid modules
    const orphanedChapters = await db
      .select({ id: chapters.id, moduleId: chapters.moduleId })
      .from(chapters)
      .leftJoin(modules, eq(chapters.moduleId, modules.id))
      .where(isNull(modules.id))
    
    if (orphanedChapters.length > 0) {
      console.error(`❌ Found ${orphanedChapters.length} chapters with invalid moduleId`)
      return false
    }
    
    // Get final statistics
    const totalModules = await db.select({ count: sql<number>`count(*)` }).from(modules)
    const totalChapters = await db.select({ count: sql<number>`count(*)` }).from(chapters)
    const migratedChapters = await db
      .select({ count: sql<number>`count(*)` })
      .from(chapters)
      .where(isNotNull(chapters.moduleId))
    
    console.log(`✅ Post-migration validation passed:`)
    console.log(`   - Total modules: ${totalModules[0]?.count || 0}`)
    console.log(`   - Total chapters: ${totalChapters[0]?.count || 0}`)
    console.log(`   - Migrated chapters: ${migratedChapters[0]?.count || 0}`)
    console.log(`   - No orphaned records found`)
    
    return true
  } catch (error) {
    console.error("❌ Post-migration validation failed:", error)
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(70))
  console.log("         MIGRATION: Course Module Structure")
  console.log("=".repeat(70))
  
  try {
    // Step 1: Pre-migration validation
    const preChecksPassed = await validatePreMigration()
    if (!preChecksPassed) {
      console.error("\n❌ Pre-migration checks failed. Migration aborted.")
      process.exit(1)
    }
    
    // Step 2: Execute migration
    const stats = await migrateToModules()
    
    // Step 3: Post-migration validation
    const postChecksPassed = await validatePostMigration()
    if (!postChecksPassed) {
      console.error("\n❌ Post-migration validation failed!")
      console.error("⚠️  Data integrity issues detected. Manual review required.")
      process.exit(1)
    }
    
    // Step 4: Print summary
    console.log("\n" + "=".repeat(70))
    console.log("         MIGRATION COMPLETE")
    console.log("=".repeat(70))
    console.log(`✅ Courses processed: ${stats.coursesProcessed}`)
    console.log(`✅ Modules created: ${stats.modulesCreated}`)
    console.log(`✅ Chapters updated: ${stats.chaptersUpdated}`)
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`)
      stats.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`)
      })
    } else {
      console.log(`\n🎉 Migration completed successfully with no errors!`)
    }
    
    console.log("\n📝 Next steps:")
    console.log("   1. Review migration results above")
    console.log("   2. Test admin interface for module management")
    console.log("   3. Test student interface for viewing modular courses")
    console.log("   4. If everything looks good, run schema finalization:")
    console.log("      - Make moduleId NOT NULL in chapters table")
    console.log("      - Drop courseId column from chapters table")
    console.log("=".repeat(70))
    
  } catch (error) {
    console.error("\n💥 Migration failed with error:", error)
    process.exit(1)
  }
}

// Run migration
main()
