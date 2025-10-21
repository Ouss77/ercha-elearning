import { eq, and, desc } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { finalProjects, projectSubmissions } from "@/drizzle/schema";

// Final Project query functions
export async function getFinalProjectById(id: number) {
  try {
    const result = await db
      .select()
      .from(finalProjects)
      .where(eq(finalProjects.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getFinalProjectsByCourse(courseId: number) {
  try {
    const result = await db
      .select()
      .from(finalProjects)
      .where(eq(finalProjects.courseId, courseId));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createFinalProject(data: {
  courseId: number;
  title: string;
  description: string;
  requirements?: any;
}) {
  try {
    const result = await db
      .insert(finalProjects)
      .values({
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateFinalProject(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    requirements: any;
  }>
) {
  try {
    const result = await db
      .update(finalProjects)
      .set(data)
      .where(eq(finalProjects.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteFinalProject(id: number) {
  try {
    const result = await db
      .delete(finalProjects)
      .where(eq(finalProjects.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

// Project Submission query functions
export async function getProjectSubmissionById(id: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getProjectSubmissionsByStudent(studentId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.studentId, studentId))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getProjectSubmissionsByProject(finalProjectId: number) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(eq(projectSubmissions.finalProjectId, finalProjectId))
      .orderBy(desc(projectSubmissions.submittedAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getStudentSubmissionForProject(
  studentId: number,
  finalProjectId: number
) {
  try {
    const result = await db
      .select()
      .from(projectSubmissions)
      .where(
        and(
          eq(projectSubmissions.studentId, studentId),
          eq(projectSubmissions.finalProjectId, finalProjectId)
        )
      )
      .orderBy(desc(projectSubmissions.submittedAt))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createProjectSubmission(data: {
  studentId: number;
  finalProjectId: number;
  submissionUrl?: string | null;
  description?: string | null;
}) {
  try {
    const result = await db
      .insert(projectSubmissions)
      .values({
        studentId: data.studentId,
        finalProjectId: data.finalProjectId,
        submissionUrl: data.submissionUrl,
        description: data.description,
        status: "submitted",
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateProjectSubmission(
  id: number,
  data: Partial<{
    submissionUrl: string | null;
    description: string | null;
    status: string;
    feedback: string | null;
    grade: number | null;
  }>
) {
  try {
    const updateData: any = { ...data };

    // If status is being changed to reviewed, set reviewedAt
    if (data.status && data.status !== "submitted") {
      updateData.reviewedAt = new Date();
    }

    const result = await db
      .update(projectSubmissions)
      .set(updateData)
      .where(eq(projectSubmissions.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteProjectSubmission(id: number) {
  try {
    const result = await db
      .delete(projectSubmissions)
      .where(eq(projectSubmissions.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return handleDbError(error);
  }
}

