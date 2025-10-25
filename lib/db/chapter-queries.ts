/**
 * Chapter and content item query operations
 *
 * This module provides database operations for managing course chapters and their content items.
 * Includes authorization checks, content management, and reordering functionality.
 *
 * Performance note: getChaptersWithContent uses optimized queries to avoid N+1 problems
 * by fetching all content items in a single query and grouping them in memory.
 *
 * @module chapter-queries
 */

import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { db } from "./index";
import { handleDbError } from "@/lib/db/error-handler";
import { chapters, contentItems, courses } from "@/drizzle/schema";
import type { Chapter, ContentItem, ChapterWithContent } from "@/types/chapter";
import type { Role } from "@/lib/schemas/user";
import type {
  CreateChapterInput,
  UpdateChapterInput,
  CreateContentItemInput,
  UpdateContentItemInput,
} from "@/lib/schemas/chapter";
import { createBaseQueries } from "./base-queries";
import { validateId, validateForeignKey, validateRequired } from "./validation";
import { batchUpdate, type Transaction } from "./transactions";
import { DbResult } from "./types";

// ============================================================================
// Authorization Helper Functions
// ============================================================================

/**
 * Check if a user can manage chapters for a specific course
 * @param userId - The user's ID
 * @param userRole - The user's role
 * @param courseId - The course ID to check access for
 * @returns Promise<boolean> - True if user has permission
 */
export async function canManageChapter(
  userId: number,
  userRole: Role,
  courseId: number
): Promise<boolean> {
  try {
    // Admins can manage all chapters
    if (userRole === "ADMIN") {
      return true;
    }

    // Trainers can manage chapters for their assigned courses
    if (userRole === "TRAINER") {
      const result = await db
        .select({ teacherId: courses.teacherId })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);

      if (result.length === 0) {
        return false;
      }

      return result[0].teacherId === userId;
    }

    // Students and sub-admins cannot manage chapters
    return false;
  } catch (error) {
    console.error("Error checking chapter management permission:", error);
    return false;
  }
}

/**
 * Check if a user can view chapters for a specific course
 * @param userId - The user's ID
 * @param userRole - The user's role
 * @param courseId - The course ID to check access for
 * @returns Promise<boolean> - True if user has permission
 */
export async function canViewChapter(
  userId: number,
  userRole: Role,
  courseId: number
): Promise<boolean> {
  try {
    // Admins can view all chapters
    if (userRole === "ADMIN") {
      return true;
    }

    // Trainers can view chapters for their assigned courses
    if (userRole === "TRAINER") {
      return canManageChapter(userId, userRole, courseId);
    }

    // Students can view chapters for enrolled courses
    if (userRole === "STUDENT") {
      const { getEnrollmentsByCourseId } = await import("./queries");
      const enrollmentsResult = await getEnrollmentsByCourseId(courseId);

      if (!enrollmentsResult.success) {
        return false;
      }

      return enrollmentsResult.data.some(
        (enrollment) => enrollment?.studentId === userId
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking chapter view permission:", error);
    return false;
  }
}

// ============================================================================
// Base Query Operations
// ============================================================================

const chapterBaseQueries = createBaseQueries(chapters, chapters.id);
const contentItemBaseQueries = createBaseQueries(contentItems, contentItems.id);

// ============================================================================
// Chapter Query Functions
// ============================================================================

/**
 * Get a chapter by ID
 * @param id - The chapter ID
 * @returns Result with chapter or null if not found
 */
export async function getChapterById(
  id: number
): Promise<DbResult<Chapter | null>> {
  return chapterBaseQueries.findById(id);
}

/**
 * Get all chapters for a course, ordered by orderIndex
 */
export async function getChaptersByCourseId(courseId: number) {
  try {
    // Query chapters through modules relationship
    const { modules } = await import("@/drizzle/schema");
    const result = await db
      .select({
        id: chapters.id,
        moduleId: chapters.moduleId,
        title: chapters.title,
        description: chapters.description,
        orderIndex: chapters.orderIndex,
        createdAt: chapters.createdAt,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(modules, eq(chapters.moduleId, modules.id))
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(chapters.orderIndex));

    return { success: true as const, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get chapters by module ID
 * @param moduleId - The module ID
 * @returns Result with chapters array
 */
export async function getChaptersByModuleId(moduleId: number) {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.moduleId, moduleId))
      .orderBy(asc(chapters.orderIndex));

    return { success: true as const, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get chapters with their content items for a course
 * Optimized to reduce N+1 queries by fetching all data in 2 queries
 *
 * @param courseId - The course ID
 * @returns Result with chapters including their content items
 *
 * @performance
 * - Complexity: O(n + m) where n = chapters, m = content items
 * - Uses only 2 database queries (chapters + all content items)
 * - Groups content items in memory to avoid N+1 problem
 * - Typical courses have 5-20 chapters with 3-10 content items each
 * - No caching needed - results are typically small and fast
 *
 * @example
 * ```typescript
 * const result = await getChaptersWithContent(courseId);
 * if (result.success) {
 *   result.data.forEach(chapter => {
 *     console.log(`${chapter.title}: ${chapter.contentItems.length} items`);
 *   });
 * }
 * ```
 */
export async function getChaptersWithContent(
  courseId: number
): Promise<DbResult<ChapterWithContent[]>> {
  const validId = validateId(courseId);
  if (!validId.success) return validId as any;

  try {
    // Fetch all chapters for the course through modules in a single query
    const { modules } = await import("@/drizzle/schema");
    const chaptersResult = await db
      .select({
        id: chapters.id,
        moduleId: chapters.moduleId,
        title: chapters.title,
        description: chapters.description,
        orderIndex: chapters.orderIndex,
        createdAt: chapters.createdAt,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(modules, eq(chapters.moduleId, modules.id))
      .where(eq(modules.courseId, validId.data))
      .orderBy(asc(chapters.orderIndex));

    if (chaptersResult.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch all content items for these chapters in a single query
    const chapterIds = chaptersResult.map((ch) => ch.id);
    const contentItemsResult = await db
      .select()
      .from(contentItems)
      .where(inArray(contentItems.chapterId, chapterIds))
      .orderBy(asc(contentItems.orderIndex));

    // Group content items by chapter ID for O(1) lookup
    const contentItemsByChapter = contentItemsResult.reduce((acc, item) => {
      if (!acc[item.chapterId]) {
        acc[item.chapterId] = [];
      }
      acc[item.chapterId].push(item as ContentItem);
      return acc;
    }, {} as Record<number, ContentItem[]>);

    // Combine chapters with their content items
    const chaptersWithContent: ChapterWithContent[] = chaptersResult.map(
      (chapter) => ({
        ...chapter,
        contentItems: contentItemsByChapter[chapter.id] || [],
      })
    );

    return { success: true, data: chaptersWithContent };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Create a new chapter with course validation
 * @param courseId - The course ID
 * @param data - Chapter creation data
 * @returns Result with the created chapter
 */
export async function createChapter(
  moduleId: number,
  data: CreateChapterInput
): Promise<DbResult<Chapter>> {
  // Validate module ID
  const validModuleId = validateId(moduleId);
  if (!validModuleId.success) return validModuleId as any;

  // Validate that the module exists
  const { modules } = await import("@/drizzle/schema");
  const moduleExists = await validateForeignKey(
    modules,
    modules.id,
    validModuleId.data,
    "moduleId"
  );
  if (!moduleExists.success) return moduleExists as any;

  // Validate required fields
  const validTitle = validateRequired(data.title, "title");
  if (!validTitle.success) return validTitle as any;

  try {
    // Get the next order index if not provided
    const maxOrderResult = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${chapters.orderIndex}), -1)`,
      })
      .from(chapters)
      .where(eq(chapters.moduleId, validModuleId.data));

    const nextOrderIndex = data.orderIndex ?? maxOrderResult[0].maxOrder + 1;

    console.log("[createChapter] Creating chapter with data:", {
      moduleId: validModuleId.data,
      title: validTitle.data,
      description: data.description,
      orderIndex: nextOrderIndex,
    });

    const result = await db
      .insert(chapters)
      .values({
        moduleId: validModuleId.data,
        title: validTitle.data,
        description: data.description ?? null,
        orderIndex: nextOrderIndex,
      })
      .returning();

    console.log("[createChapter] Successfully created chapter:", result[0]);

    return { success: true, data: result[0] as Chapter };
  } catch (error) {
    console.error("[createChapter] Error creating chapter:", error);
    return handleDbError(error);
  }
}

/**
 * Update a chapter using base queries
 * @param id - The chapter ID
 * @param data - Chapter update data
 * @returns Result with the updated chapter
 */
export async function updateChapter(
  id: number,
  data: UpdateChapterInput
): Promise<DbResult<Chapter>> {
  const validId = validateId(id);
  if (!validId.success) return validId as any;

  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    return await chapterBaseQueries.update(validId.data, updateData);
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Delete a chapter and all its content items (cascade handled by DB)
 * @param id - The chapter ID
 * @returns Result with the deleted chapter
 */
export async function deleteChapter(id: number): Promise<DbResult<Chapter>> {
  return chapterBaseQueries.delete(id);
}

/**
 * Reorder chapters within a course using batch operations
 * @param courseId - The course ID
 * @param chapterIds - Array of chapter IDs in the desired order
 * @returns Result with success message
 */
export async function reorderChapters(
  moduleId: number,
  chapterIds: number[]
): Promise<DbResult<{ message: string }>> {
  const validModuleId = validateId(moduleId);
  if (!validModuleId.success) return validModuleId as any;

  if (!chapterIds || chapterIds.length === 0) {
    return {
      success: false,
      error: "Chapter IDs array cannot be empty",
    };
  }

  try {
    // Prepare batch updates with new order indices
    const updates = chapterIds.map((chapterId, index) => ({
      id: chapterId,
      data: { orderIndex: index, updatedAt: new Date() },
    }));

    // Use batch update for better performance
    const result = await batchUpdate(chapters, updates, chapters.id);

    if (!result.success) return result as any;

    return {
      success: true,
      data: { message: "Chapters reordered successfully" },
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// ============================================================================
// Content Item Query Functions
// ============================================================================

/**
 * Get a content item by ID using base queries
 * @param id - The content item ID
 * @returns Result with content item or null if not found
 */
export async function getContentItemById(
  id: number
): Promise<DbResult<ContentItem | null>> {
  const result = await contentItemBaseQueries.findById(id);
  if (!result.success) return result;
  return {
    success: true,
    data: result.data as ContentItem | null,
  };
}

/**
 * Get all content items for a chapter, ordered by orderIndex
 */
export async function getContentItemsByChapterId(chapterId: number) {
  try {
    const result = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.chapterId, chapterId))
      .orderBy(asc(contentItems.orderIndex));

    return { success: true as const, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Create a new content item with chapter validation
 * @param chapterId - The chapter ID
 * @param data - Content item creation data
 * @returns Result with the created content item
 */
export async function createContentItem(
  chapterId: number,
  data: CreateContentItemInput
): Promise<DbResult<ContentItem>> {
  // Validate chapter ID
  const validChapterId = validateId(chapterId);
  if (!validChapterId.success) return validChapterId as any;

  // Validate that the chapter exists
  const chapterExists = await validateForeignKey(
    chapters,
    chapters.id,
    validChapterId.data,
    "chapterId"
  );
  if (!chapterExists.success) return chapterExists as any;

  // Validate required fields
  const validTitle = validateRequired(data.title, "title");
  if (!validTitle.success) return validTitle as any;

  const validContentType = validateRequired(data.contentType, "contentType");
  if (!validContentType.success) return validContentType as any;

  try {
    console.log("[createContentItem] Creating content item:", {
      chapterId: validChapterId.data,
      title: validTitle.data,
      contentType: validContentType.data,
    });

    // Get the next order index if not provided
    const maxOrderResult = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${contentItems.orderIndex}), -1)`,
      })
      .from(contentItems)
      .where(eq(contentItems.chapterId, validChapterId.data));

    const nextOrderIndex = data.orderIndex ?? maxOrderResult[0].maxOrder + 1;

    const result = await db
      .insert(contentItems)
      .values({
        chapterId: validChapterId.data,
        title: validTitle.data,
        contentType: validContentType.data,
        contentData: data.contentData as any,
        orderIndex: nextOrderIndex,
      })
      .returning();

    console.log(
      "[createContentItem] Successfully created content item:",
      result[0].id
    );

    return { success: true, data: result[0] as ContentItem };
  } catch (error) {
    console.error("[createContentItem] Error creating content item:", error);
    return handleDbError(error);
  }
}

/**
 * Update a content item using base queries
 * @param id - The content item ID
 * @param data - Content item update data
 * @returns Result with the updated content item
 */
export async function updateContentItem(
  id: number,
  data: UpdateContentItemInput
): Promise<DbResult<ContentItem>> {
  const validId = validateId(id);
  if (!validId.success) return validId as any;

  try {
    console.log("[updateContentItem] Updating content item:", {
      id: validId.data,
      title: data.title,
      hasContentData: !!data.contentData,
    });

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // If contentData is provided, ensure it's properly formatted
    if (data.contentData) {
      updateData.contentData = data.contentData as any;
    }

    const result = await contentItemBaseQueries.update(
      validId.data,
      updateData
    );

    if (result.success) {
      console.log(
        "[updateContentItem] Successfully updated content item:",
        validId.data
      );
    } else {
      console.error(
        "[updateContentItem] Content item not found:",
        validId.data
      );
    }

    return result as DbResult<ContentItem>;
  } catch (error) {
    console.error("[updateContentItem] Error updating content item:", error);
    return handleDbError(error);
  }
}

/**
 * Delete a content item and adjust order indices
 * @param id - The content item ID
 * @returns Result with the deleted content item
 */
export async function deleteContentItem(
  id: number
): Promise<DbResult<ContentItem>> {
  const validId = validateId(id);
  if (!validId.success) return validId as any;

  try {
    // Get the content item to know its chapter and order
    const contentItemResult = await contentItemBaseQueries.findById(
      validId.data
    );

    if (!contentItemResult.success) return contentItemResult;

    if (!contentItemResult.data) {
      return { success: false, error: "Content item not found" };
    }

    const deletedItem = contentItemResult.data;

    // Delete the content item using base queries
    const deleteResult = await contentItemBaseQueries.delete(validId.data);

    if (!deleteResult.success) return deleteResult;

    // Adjust order_index of remaining content items in the same chapter
    await db
      .update(contentItems)
      .set({
        orderIndex: sql`${contentItems.orderIndex} - 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(contentItems.chapterId, deletedItem.chapterId),
          sql`${contentItems.orderIndex} > ${deletedItem.orderIndex}`
        )
      );

    return { success: true, data: deletedItem as ContentItem };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Reorder content items within a chapter using batch operations
 * @param chapterId - The chapter ID
 * @param contentItemIds - Array of content item IDs in the desired order
 * @returns Result with success message
 */
export async function reorderContentItems(
  chapterId: number,
  contentItemIds: number[]
): Promise<DbResult<{ message: string }>> {
  const validChapterId = validateId(chapterId);
  if (!validChapterId.success) return validChapterId as any;

  if (!contentItemIds || contentItemIds.length === 0) {
    return {
      success: false,
      error: "Content item IDs array cannot be empty",
    };
  }

  try {
    // Prepare batch updates with new order indices
    const updates = contentItemIds.map((contentItemId, index) => ({
      id: contentItemId,
      data: { orderIndex: index, updatedAt: new Date() },
    }));

    // Use batch update for better performance
    const result = await batchUpdate(contentItems, updates, contentItems.id);

    if (!result.success) return result as any;

    return {
      success: true,
      data: { message: "Content items reordered successfully" },
    };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get the course ID for a chapter
 * Helper function for authorization checks
 */
export async function getCourseIdByChapterId(
  chapterId: number
): Promise<number | null> {
  try {
    const { modules } = await import("@/drizzle/schema");
    const result = await db
      .select({ courseId: modules.courseId })
      .from(chapters)
      .innerJoin(modules, eq(chapters.moduleId, modules.id))
      .where(eq(chapters.id, chapterId))
      .limit(1);

    return result.length > 0 ? result[0].courseId : null;
  } catch (error) {
    console.error("Error getting course ID by chapter ID:", error);
    return null;
  }
}

/**
 * Move a chapter to a different module
 * @param chapterId - The chapter ID to move
 * @param targetModuleId - The target module ID
 * @param targetOrderIndex - Optional target position within the module
 * @returns Result with updated chapter
 */
export async function moveChapter(
  chapterId: number,
  targetModuleId: number,
  targetOrderIndex?: number
): Promise<DbResult<Chapter>> {
  const validChapterId = validateId(chapterId);
  if (!validChapterId.success) return validChapterId as any;

  const validModuleId = validateId(targetModuleId);
  if (!validModuleId.success) return validModuleId as any;

  try {
    // Validate that the target module exists
    const { modules } = await import("@/drizzle/schema");
    const moduleExists = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.id, validModuleId.data))
      .limit(1);

    if (moduleExists.length === 0) {
      return {
        success: false,
        error: "Target module not found",
      };
    }

    // If targetOrderIndex is not provided, append to end of module
    let finalOrderIndex = targetOrderIndex;
    if (finalOrderIndex === undefined) {
      const maxOrderResult = await db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${chapters.orderIndex}), -1)`,
        })
        .from(chapters)
        .where(eq(chapters.moduleId, validModuleId.data));

      finalOrderIndex = maxOrderResult[0].maxOrder + 1;
    }

    // Move the chapter to the new module
    const result = await db
      .update(chapters)
      .set({
        moduleId: validModuleId.data,
        orderIndex: finalOrderIndex,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, validChapterId.data))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Chapter not found",
      };
    }

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get the course ID for a content item
 * Helper function for authorization checks
 */
export async function getCourseIdByContentItemId(
  contentItemId: number
): Promise<number | null> {
  try {
    const { modules } = await import("@/drizzle/schema");
    const result = await db
      .select({ courseId: modules.courseId })
      .from(contentItems)
      .innerJoin(chapters, eq(contentItems.chapterId, chapters.id))
      .innerJoin(modules, eq(chapters.moduleId, modules.id))
      .where(eq(contentItems.id, contentItemId))
      .limit(1);

    return result.length > 0 ? result[0].courseId : null;
  } catch (error) {
    console.error("Error getting course ID by content item ID:", error);
    return null;
  }
}
