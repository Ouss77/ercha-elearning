import { eq, desc, sql } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { courses, domains, users, enrollments, chapters } from "@/drizzle/schema";
import { mapCourseFromDb } from "./mappers";

// Course query functions
export async function createCourse(data: {
  title: string;
  description?: string | null;
  domainId: number;
  teacherId?: number | null;
  thumbnailUrl?: string | null;
  isActive?: boolean;
}) {
  try {
    const result = await db
      .insert(courses)
      .values({
        title: data.title,
        description: data.description,
        domainId: data.domainId,
        teacherId: data.teacherId,
        thumbnailUrl: data.thumbnailUrl,
        isActive: data.isActive ?? false,
      })
      .returning();

    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function updateCourse(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    domainId: number;
    teacherId: number | null;
    thumbnailUrl: string | null;
    isActive: boolean;
  }>
) {
  try {
    const result = await db
      .update(courses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCourseById(id: number) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getAllCourses() {
  try {
    const result = await db.select().from(courses);
    const mappedCourses = result.map(mapCourseFromDb).filter((c) => c !== null);
    return { success: true, data: mappedCourses };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCoursesByTeacherId(teacherId: number) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.teacherId, teacherId));
    const mappedCourses = result.map(mapCourseFromDb).filter((c) => c !== null);
    return { success: true, data: mappedCourses };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCoursesByDomainId(domainId: number) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.domainId, domainId));
    const mappedCourses = result.map(mapCourseFromDb).filter((c) => c !== null);
    return { success: true, data: mappedCourses };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteCourse(id: number) {
  try {
    const result = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();

    const mappedCourse = mapCourseFromDb(result[0]);
    return { success: true, data: mappedCourse };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCoursesWithDetails() {
  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        domainId: courses.domainId,
        teacherId: courses.teacherId,
        thumbnailUrl: courses.thumbnailUrl,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        domain: {
          id: domains.id,
          name: domains.name,
          color: domains.color,
        },
        teacher: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        enrollmentCount: sql<number>`cast(count(distinct ${enrollments.id}) as int)`,
        chapterCount: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
      .groupBy(
        courses.id,
        domains.id,
        domains.name,
        domains.color,
        users.id,
        users.name,
        users.email
      )
      .orderBy(desc(courses.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCourseWithDetails(id: number) {
  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        domainId: courses.domainId,
        teacherId: courses.teacherId,
        thumbnailUrl: courses.thumbnailUrl,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        domain: {
          id: domains.id,
          name: domains.name,
          color: domains.color,
        },
        teacher: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        enrollmentCount: sql<number>`cast(count(distinct ${enrollments.id}) as int)`,
        chapterCount: sql<number>`cast(count(distinct ${chapters.id}) as int)`,
      })
      .from(courses)
      .leftJoin(domains, eq(courses.domainId, domains.id))
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(chapters, eq(courses.id, chapters.courseId))
      .where(eq(courses.id, id))
      .groupBy(
        courses.id,
        domains.id,
        domains.name,
        domains.color,
        users.id,
        users.name,
        users.email
      )
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function courseHasEnrollments(courseId: number) {
  try {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));

    return { success: true, data: result[0].count > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

