import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { chapters, contentItems, courses } from "@/drizzle/schema";
import type { Chapter, ContentItem, ChapterWithContent } from "@/types/chapter";
import type { Role } from "@/lib/schemas/user";
import type {
  CreateChapterInput,
  UpdateChapterInput,
  CreateContentItemInput,
  UpdateContentItemInput,
} from "@/lib/schemas/chapter";

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
// Chapter Query Functions
// ============================================================================

/**
 * Get a chapter by ID
 */
export async function getChapterById(id: number) {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, id))
      .limit(1);

    return { success: true as const, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get all chapters for a course, ordered by orderIndex
 */
export async function getChaptersByCourseId(courseId: number) {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(asc(chapters.orderIndex));

    return { success: true as const, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Get chapters with their content items for a course
 */
export async function getChaptersWithContent(
  courseId: number
): Promise<{ success: true; data: ChapterWithContent[] } | { success: false; error: string }> {
  try {
    // Fetch all chapters for the course
    const chaptersResult = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(asc(chapters.orderIndex));

    // Fetch all content items for these chapters
    const chapterIds = chaptersResult.map((ch) => ch.id);
    
    let contentItemsResult: any[] = [];
    if (chapterIds.length > 0) {
      contentItemsResult = await db
        .select()
        .from(contentItems)
        .where(inArray(contentItems.chapterId, chapterIds))
        .orderBy(asc(contentItems.orderIndex));
    }

    // Group content items by chapter
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
        courseId: chapter.courseId!,
        contentItems: contentItemsByChapter[chapter.id] || [],
      })
    );

    return { success: true, data: chaptersWithContent };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Create a new chapter
 */
export async function createChapter(
  courseId: number,
  data: CreateChapterInput
) {
  try {
    // Get the next order index
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${chapters.orderIndex}), -1)` })
      .from(chapters)
      .where(eq(chapters.courseId, courseId));

    const nextOrderIndex = data.orderIndex ?? (maxOrderResult[0].maxOrder + 1);

    const result = await db
      .insert(chapters)
      .values({
        courseId,
        title: data.title,
        description: data.description ?? null,
        orderIndex: nextOrderIndex,
      })
      .returning();

    return { success: true as const, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Update a chapter
 */
export async function updateChapter(id: number, data: UpdateChapterInput) {
  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .update(chapters)
      .set(updateData)
      .where(eq(chapters.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false as const, error: "Chapter not found" };
    }

    return { success: true as const, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Delete a chapter and all its content items (cascade handled by DB)
 */
export async function deleteChapter(id: number) {
  try {
    const result = await db
      .delete(chapters)
      .where(eq(chapters.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false as const, error: "Chapter not found" };
    }

    return { success: true as const, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Reorder chapters within a course
 * @param courseId - The course ID
 * @param chapterIds - Array of chapter IDs in the desired order
 */
export async function reorderChapters(courseId: number, chapterIds: number[]) {
  try {
    // Update order_index for each chapter
    const updates = chapterIds.map((chapterId, index) =>
      db
        .update(chapters)
        .set({ orderIndex: index, updatedAt: new Date() })
        .where(and(eq(chapters.id, chapterId), eq(chapters.courseId, courseId)))
    );

    await Promise.all(updates);

    return {
      success: true as const,
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
 * Get a content item by ID
 */
export async function getContentItemById(id: number) {
  try {
    const result = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, id))
      .limit(1);

    return { success: true as const, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
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
 * Create a new content item
 */
export async function createContentItem(
  chapterId: number,
  data: CreateContentItemInput
) {
  try {
    // Get the next order index
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${contentItems.orderIndex}), -1)` })
      .from(contentItems)
      .where(eq(contentItems.chapterId, chapterId));

    const nextOrderIndex = data.orderIndex ?? (maxOrderResult[0].maxOrder + 1);

    const result = await db
      .insert(contentItems)
      .values({
        chapterId,
        title: data.title,
        contentType: data.contentType,
        contentData: data.contentData as any,
        orderIndex: nextOrderIndex,
      })
      .returning();

    return { success: true as const, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Update a content item
 */
export async function updateContentItem(
  id: number,
  data: UpdateContentItemInput
) {
  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // If contentData is provided, ensure it's properly formatted
    if (data.contentData) {
      updateData.contentData = data.contentData as any;
    }

    const result = await db
      .update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false as const, error: "Content item not found" };
    }

    return { success: true as const, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Delete a content item
 */
export async function deleteContentItem(id: number) {
  try {
    // Get the content item to know its chapter and order
    const contentItem = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, id))
      .limit(1);

    if (contentItem.length === 0) {
      return { success: false as const, error: "Content item not found" };
    }

    const deletedItem = contentItem[0];

    // Delete the content item
    await db.delete(contentItems).where(eq(contentItems.id, id));

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

    return { success: true as const, data: deletedItem };
  } catch (error) {
    return handleDbError(error);
  }
}

/**
 * Reorder content items within a chapter
 * @param chapterId - The chapter ID
 * @param contentItemIds - Array of content item IDs in the desired order
 */
export async function reorderContentItems(
  chapterId: number,
  contentItemIds: number[]
) {
  try {
    // Update order_index for each content item
    const updates = contentItemIds.map((contentItemId, index) =>
      db
        .update(contentItems)
        .set({ orderIndex: index, updatedAt: new Date() })
        .where(
          and(
            eq(contentItems.id, contentItemId),
            eq(contentItems.chapterId, chapterId)
          )
        )
    );

    await Promise.all(updates);

    return {
      success: true as const,
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
    const result = await db
      .select({ courseId: chapters.courseId })
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    return result.length > 0 ? result[0].courseId : null;
  } catch (error) {
    console.error("Error getting course ID by chapter ID:", error);
    return null;
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
    const result = await db
      .select({ courseId: chapters.courseId })
      .from(contentItems)
      .innerJoin(chapters, eq(contentItems.chapterId, chapters.id))
      .where(eq(contentItems.id, contentItemId))
      .limit(1);

    return result.length > 0 ? result[0].courseId : null;
  } catch (error) {
    console.error("Error getting course ID by content item ID:", error);
    return null;
  }
}
