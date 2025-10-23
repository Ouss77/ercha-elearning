/**
 * Example usage of transaction utilities
 *
 * This file demonstrates how to use the transaction support functions
 * for database operations with automatic rollback on errors.
 */

import {
  withTransaction,
  batchCreate,
  batchUpdate,
  batchDelete,
  Transaction,
} from "./transactions";
import { users, courses, enrollments } from "@/drizzle/schema";
import { DbResult } from "./types";

/**
 * Example 1: Simple transaction with multiple operations
 * Creates a user and enrolls them in a course atomically
 */
export async function enrollNewStudent(
  userData: { email: string; name: string; password: string },
  courseId: number
): Promise<DbResult<{ userId: number; enrollmentId: number }>> {
  return withTransaction(async (tx) => {
    // Create user
    const userResult = await tx.insert(users).values(userData).returning();

    if (userResult.length === 0) {
      return {
        success: false,
        error: "Failed to create user",
      };
    }

    const user = userResult[0];

    // Create enrollment
    const enrollmentResult = await tx
      .insert(enrollments)
      .values({
        studentId: user.id,
        courseId,
      })
      .returning();

    if (enrollmentResult.length === 0) {
      return {
        success: false,
        error: "Failed to create enrollment",
      };
    }

    return {
      success: true,
      data: {
        userId: user.id,
        enrollmentId: enrollmentResult[0].id,
      },
    };
  });
}

/**
 * Example 2: Batch create multiple users
 */
export async function createMultipleUsers(
  usersData: Array<{ email: string; name: string; password: string }>
): Promise<DbResult<any[]>> {
  return batchCreate(users, usersData);
}

/**
 * Example 3: Batch update with transaction
 */
export async function updateMultipleUserNames(
  updates: Array<{ id: number; name: string }>
): Promise<DbResult<any[]>> {
  return withTransaction(async (tx) => {
    return batchUpdate(
      users,
      updates.map((u) => ({ id: u.id, data: { name: u.name } })),
      users.id,
      tx
    );
  });
}

/**
 * Example 4: Complex transaction with validation
 */
export async function transferCourseOwnership(
  courseId: number,
  newTeacherId: number
): Promise<DbResult<any>> {
  return withTransaction(async (tx) => {
    const { eq } = await import("drizzle-orm");

    // Verify new teacher exists
    const teacher = await tx
      .select()
      .from(users)
      .where(eq(users.id, newTeacherId))
      .limit(1);

    if (teacher.length === 0) {
      return {
        success: false,
        error: "Teacher not found",
      };
    }

    if (teacher[0].role !== "TRAINER") {
      return {
        success: false,
        error: "User is not a trainer",
      };
    }

    // Update course
    const result = await tx
      .update(courses)
      .set({ teacherId: newTeacherId })
      .where(eq(courses.id, courseId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Course not found",
      };
    }

    return {
      success: true,
      data: result[0],
    };
  });
}

/**
 * Example 5: Batch delete with validation
 */
export async function deleteInactiveUsers(
  userIds: number[]
): Promise<DbResult<any[]>> {
  return withTransaction(async (tx) => {
    const { inArray, eq } = await import("drizzle-orm");

    // Verify all users are inactive
    const usersToDelete = await tx
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    const activeUsers = usersToDelete.filter((u) => u.isActive);
    if (activeUsers.length > 0) {
      return {
        success: false,
        error: `Cannot delete active users: ${activeUsers
          .map((u) => u.email)
          .join(", ")}`,
      };
    }

    // Delete users
    return batchDelete(users, userIds, users.id, tx);
  });
}

/**
 * Example 6: Nested operations with error handling
 */
export async function createCourseWithChapters(
  courseData: {
    title: string;
    slug: string;
    description?: string;
    teacherId: number;
  },
  chaptersData: Array<{
    title: string;
    description?: string;
    orderIndex: number;
  }>
): Promise<DbResult<{ courseId: number; chapterIds: number[] }>> {
  return withTransaction(async (tx) => {
    // Create course
    const courseResult = await tx
      .insert(courses)
      .values(courseData)
      .returning();

    if (courseResult.length === 0) {
      return {
        success: false,
        error: "Failed to create course",
      };
    }

    const course = courseResult[0];

    // Create chapters
    const { chapters } = await import("@/drizzle/schema");
    const chaptersWithCourseId = chaptersData.map((chapter) => ({
      ...chapter,
      courseId: course.id,
    }));

    const chaptersResult = await batchCreate(
      chapters,
      chaptersWithCourseId,
      tx
    );

    if (!chaptersResult.success) {
      return chaptersResult;
    }

    return {
      success: true,
      data: {
        courseId: course.id,
        chapterIds: chaptersResult.data.map((c: any) => c.id),
      },
    };
  });
}
