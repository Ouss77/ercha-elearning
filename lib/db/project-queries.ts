/**
 * Project query functions
 * 
 * This module provides database operations for final projects and project submissions.
 * Uses base query utilities for consistent patterns and error handling.
 */

import { eq, and, desc } from "drizzle-orm";
import { db } from "./index";
import { handleDbError } from "./error-handler";
import { finalProjects, projectSubmissions, courses, users, domains } from "@/drizzle/schema";
import { createBaseQueries } from "./base-queries";
import { validateId, validateRequired, validateForeignKey, validateString } from "./validation";
import { DbResult } from "./types";

// Create base query operations for final projects and project submissions
const finalProjectBaseQueries = createBaseQueries(finalProjects, finalProjects.id);
const projectSubmissionBaseQueries = createBaseQueries(projectSubmissions, projectSubmissions.id);

/**
 * Get a final project by ID
 * 
 * @param id - The final project ID
 * @returns Result with final project data or null if not found
 * 
 * @example
 * ```typescript
 * const project = await getFinalProjectById(1);
 * if (!project.success) return project;
 * ```
 */
export async function getFinalProjectById(id: number): Promise<DbResult<typeof finalProjects.$inferSelect | null>> {
  return finalProjectBaseQueries.findById(id);
}

/**
 * Get all final projects for a specific course
 * 
 * @param courseId - The course ID
 * @returns Result with array of final projects
 */
export async function getFinalProjectsByCourse(courseId: number): Promise<DbResult<(typeof finalProjects.$inferSelect)[]>> {
  const validId = validateId(courseId);
  if (!validId.success) return validId as any;

  return finalProjectBaseQueries.findMany(eq(finalProjects.courseId, validId.data));
}

/**
 * Create a new final project with course validation
 * 
 * @param data - Final project data including courseId, title, description, and optional requirements
 * @returns Result with created final project
 * 
 * @example
 * ```typescript
 * const project = await createFinalProject({
 *   courseId: 1,
 *   title: 'Final Project',
 *   description: 'Build a complete application',
 *   requirements: { minFeatures: 5 }
 * });
 * ```
 */
export async function createFinalProject(data: {
  courseId: number;
  title: string;
  description: string;
  requirements?: any;
}): Promise<DbResult<typeof finalProjects.$inferSelect>> {
  // Validate course ID
  const validCourseId = validateId(data.courseId);
  if (!validCourseId.success) return validCourseId as any;

  // Validate title
  const validTitle = validateString(data.title, 'title', { minLength: 1, maxLength: 200 });
  if (!validTitle.success) return validTitle as any;

  // Validate description
  const validDescription = validateRequired(data.description, 'description');
  if (!validDescription.success) return validDescription as any;

  // Validate that course exists
  const courseExists = await validateForeignKey(
    courses,
    courses.id,
    validCourseId.data,
    'courseId'
  );
  if (!courseExists.success) return courseExists as any;

  // Create final project
  return finalProjectBaseQueries.create({
    courseId: validCourseId.data,
    title: validTitle.data,
    description: validDescription.data,
    requirements: data.requirements,
  });
}

/**
 * Update a final project
 * 
 * @param id - The final project ID
 * @param data - Partial final project data to update
 * @returns Result with updated final project
 */
export async function updateFinalProject(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    requirements: any;
  }>
): Promise<DbResult<typeof finalProjects.$inferSelect>> {
  // Validate title if provided
  if (data.title !== undefined) {
    const validTitle = validateString(data.title, 'title', { minLength: 1, maxLength: 200 });
    if (!validTitle.success) return validTitle as any;
    data.title = validTitle.data;
  }

  // Validate description if provided
  if (data.description !== undefined) {
    const validDescription = validateRequired(data.description, 'description');
    if (!validDescription.success) return validDescription as any;
  }

  return finalProjectBaseQueries.update(id, data);
}

/**
 * Delete a final project
 * 
 * @param id - The final project ID
 * @returns Result with deleted final project
 */
export async function deleteFinalProject(id: number): Promise<DbResult<typeof finalProjects.$inferSelect>> {
  return finalProjectBaseQueries.delete(id);
}

// Project Submission query functions

/**
 * Get a project submission by ID
 * 
 * @param id - The project submission ID
 * @returns Result with project submission data or null if not found
 */
export async function getProjectSubmissionById(id: number): Promise<DbResult<typeof projectSubmissions.$inferSelect | null>> {
  return projectSubmissionBaseQueries.findById(id);
}

/**
 * Get all project submissions for a specific student
 * 
 * @param studentId - The student ID
 * @returns Result with array of project submissions ordered by submission date
 */
export async function getProjectSubmissionsByStudent(studentId: number): Promise<DbResult<(typeof projectSubmissions.$inferSelect)[]>> {
  const validId = validateId(studentId);
  if (!validId.success) return validId as any;

  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.studentId, validId.data))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getProjectSubmissionsByStudent');
  }
}

/**
 * Get all project submissions for a specific final project
 * 
 * @param finalProjectId - The final project ID
 * @returns Result with array of project submissions ordered by submission date
 */
export async function getProjectSubmissionsByProject(finalProjectId: number): Promise<DbResult<(typeof projectSubmissions.$inferSelect)[]>> {
  const validId = validateId(finalProjectId);
  if (!validId.success) return validId as any;

  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.finalProjectId, validId.data))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getProjectSubmissionsByProject');
  }
}

/**
 * Get the most recent submission for a specific student and project
 * Optimized to return only the latest submission
 * 
 * @param studentId - The student ID
 * @param finalProjectId - The final project ID
 * @returns Result with the most recent project submission or null if not found
 * 
 * @example
 * ```typescript
 * const submission = await getStudentSubmissionForProject(1, 5);
 * if (!submission.success) return submission;
 * if (submission.data) {
 *   console.log('Latest submission:', submission.data);
 * }
 * ```
 */
export async function getStudentSubmissionForProject(
  studentId: number,
  finalProjectId: number
): Promise<DbResult<typeof projectSubmissions.$inferSelect | null>> {
  // Validate student ID
  const validStudentId = validateId(studentId);
  if (!validStudentId.success) return validStudentId as any;

  // Validate final project ID
  const validProjectId = validateId(finalProjectId);
  if (!validProjectId.success) return validProjectId as any;

  try {
    // Query for the most recent submission with ordering
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(
        and(
          eq(projectSubmissions.studentId, validStudentId.data),
          eq(projectSubmissions.finalProjectId, validProjectId.data)
        )
      )
      .orderBy(desc(projectSubmissions.submittedAt))
      .limit(1);

    return {
      success: true,
      data: result[0] || null,
    };
  } catch (error) {
    return handleDbError(error, 'getStudentSubmissionForProject');
  }
}

/**
 * Create a new project submission with validation
 * 
 * @param data - Project submission data including studentId, finalProjectId, and optional submissionUrl and description
 * @returns Result with created project submission
 * 
 * @example
 * ```typescript
 * const submission = await createProjectSubmission({
 *   studentId: 1,
 *   finalProjectId: 5,
 *   submissionUrl: 'https://github.com/user/project',
 *   description: 'My final project submission'
 * });
 * ```
 */
export async function createProjectSubmission(data: {
  studentId: number;
  finalProjectId: number;
  submissionUrl?: string | null;
  description?: string | null;
}): Promise<DbResult<typeof projectSubmissions.$inferSelect>> {
  // Validate student ID
  const validStudentId = validateId(data.studentId);
  if (!validStudentId.success) return validStudentId as any;

  // Validate final project ID
  const validProjectId = validateId(data.finalProjectId);
  if (!validProjectId.success) return validProjectId as any;

  // Validate that final project exists
  const projectExists = await validateForeignKey(
    finalProjects,
    finalProjects.id,
    validProjectId.data,
    'finalProjectId'
  );
  if (!projectExists.success) return projectExists as any;

  // Create project submission
  return projectSubmissionBaseQueries.create({
    studentId: validStudentId.data,
    finalProjectId: validProjectId.data,
    submissionUrl: data.submissionUrl,
    description: data.description,
    status: "submitted",
  });
}

/**
 * Update a project submission
 * Automatically sets reviewedAt timestamp when status changes from submitted
 * 
 * @param id - The project submission ID
 * @param data - Partial project submission data to update
 * @returns Result with updated project submission
 * 
 * @example
 * ```typescript
 * const updated = await updateProjectSubmission(1, {
 *   status: 'reviewed',
 *   feedback: 'Great work!',
 *   grade: 95
 * });
 * ```
 */
export async function updateProjectSubmission(
  id: number,
  data: Partial<{
    submissionUrl: string | null;
    description: string | null;
    status: string;
    feedback: string | null;
    grade: number | null;
  }>
): Promise<DbResult<typeof projectSubmissions.$inferSelect>> {
  const updateData: any = { ...data };

  // If status is being changed to reviewed, set reviewedAt
  if (data.status && data.status !== "submitted") {
    updateData.reviewedAt = new Date();
  }

  return projectSubmissionBaseQueries.update(id, updateData);
}

/**
 * Delete a project submission
 * 
 * @param id - The project submission ID
 * @returns Result with deleted project submission
 */
export async function deleteProjectSubmission(id: number): Promise<DbResult<typeof projectSubmissions.$inferSelect>> {
  return projectSubmissionBaseQueries.delete(id);
}


/**
 * Get all project submissions for a teacher's courses
 * Includes student, project, course, and domain information
 * 
 * @param teacherId - The teacher ID
 * @returns Result with enriched project submissions
 * 
 * @performance
 * - Uses joins to avoid N+1 queries
 * - Ordered by submission date (most recent first)
 * 
 * @example
 * ```typescript
 * const result = await getTeacherProjectSubmissions(teacherId);
 * if (result.success) {
 *   result.data.forEach(submission => {
 *     console.log(`${submission.studentName}: ${submission.projectTitle}`);
 *   });
 * }
 * ```
 */
export async function getTeacherProjectSubmissions(teacherId: number) {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    const result = await db
      .select({
        submissionId: projectSubmissions.id,
        submissionUrl: projectSubmissions.submissionUrl,
        description: projectSubmissions.description,
        status: projectSubmissions.status,
        feedback: projectSubmissions.feedback,
        grade: projectSubmissions.grade,
        submittedAt: projectSubmissions.submittedAt,
        reviewedAt: projectSubmissions.reviewedAt,

        // Student info
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatar: users.avatarUrl,

        // Project info
        projectId: finalProjects.id,
        projectTitle: finalProjects.title,
        projectDescription: finalProjects.description,

        // Course info
        courseId: courses.id,
        courseTitle: courses.title,
        courseThumbnail: courses.thumbnailUrl,

        // Domain info
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
      })
      .from(projectSubmissions)
      .innerJoin(users, eq(projectSubmissions.studentId, users.id))
      .innerJoin(
        finalProjects,
        eq(projectSubmissions.finalProjectId, finalProjects.id)
      )
      .innerJoin(courses, eq(finalProjects.courseId, courses.id))
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .where(eq(courses.teacherId, validId.data))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getTeacherProjectSubmissions');
  }
}
