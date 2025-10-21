import { eq } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { enrollments, courses } from "@/drizzle/schema";
import { mapEnrollmentFromDb } from "./mappers";

// Enrollment query functions
export async function getEnrollmentById(id: number) {
  try {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1);
    const mappedEnrollment = mapEnrollmentFromDb(result[0]);
    return { success: true, data: mappedEnrollment };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getEnrollmentsByStudentId(studentId: number) {
  try {
    const result = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        enrolledAt: enrollments.createdAt,
        completedAt: enrollments.completedAt,
        course: {
          id: courses.id,
          title: courses.title,
          description: courses.description,
          isActive: courses.isActive,
        },
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getEnrollmentsByCourseId(courseId: number) {
  try {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));
    const mappedEnrollments = result
      .map(mapEnrollmentFromDb)
      .filter((e) => e !== null);
    return { success: true, data: mappedEnrollments };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function createEnrollment(data: {
  studentId: number;
  courseId: number;
}) {
  try {
    const result = await db
      .insert(enrollments)
      .values({
        studentId: data.studentId,
        courseId: data.courseId,
      })
      .returning();

    const mappedEnrollment = mapEnrollmentFromDb(result[0]);
    return { success: true, data: mappedEnrollment };
  } catch (error) {
    return handleDbError(error);
  }
}

