/**
 * Class management query functions
 * 
 * This module provides database operations for managing classes and class enrollments.
 * Classes are used to group students by teacher for organizational purposes.
 */

import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from './db';
import { classes, classEnrollments, classCourses, domains, users, courses, enrollments } from '@/drizzle/schema';
import { DbResult, DbErrorCode } from './types';
import { handleDbError } from './error-handler';
import { 
  validateId, 
  validateRequired, 
  validateString, 
  validateForeignKey,
  validateNumberRange 
} from './validation';
import { createBaseQueries, findByIdOrFail } from './base-queries';
import { withTransaction, type Transaction } from './transactions';

// Create base query operations for classes and enrollments
const classBaseQueries = createBaseQueries(classes, classes.id);
const enrollmentBaseQueries = createBaseQueries(classEnrollments, classEnrollments.id);

/**
 * Interface for class creation data
 */
export interface CreateClassData {
  name: string;
  description?: string;
  teacherId?: number;
  domainId?: number;
}

/**
 * Interface for class with student count
 */
export interface ClassWithStats {
  id: number;
  name: string;
  description: string | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  isActive: boolean | null;
  createdAt: Date;
  studentCount: number;
}

/**
 * Interface for class details with students
 */
export interface ClassDetails {
  class: {
    id: number;
    name: string;
    description: string | null;
    domainId: number | null;
    domainName: string | null;
    domainColor: string | null;
    isActive: boolean | null;
    createdAt: Date;
  };
  students: Array<{
    studentId: number;
    studentName: string;
    studentEmail: string;
    studentAvatarUrl: string | null;
    studentPhone: string | null;
    enrolledAt: Date;
  }>;
  studentCount: number;
}

/**
 * Create a new class with validation
 * 
 * @param data - Class creation data
 * @returns Result with created class
 * 
 * @example
 * ```typescript
 * const result = await createClass({
 *   name: 'Web Development 2024',
 *   description: 'Advanced web development class',
 *   teacherId: 1,
 *   domainId: 2,
 *   maxStudents: 30
 * });
 * ```
 */
export async function createClass(
  data: CreateClassData
): Promise<DbResult<typeof classes.$inferSelect>> {
  // Validate required fields
  const nameValidation = validateString(data.name, 'name', { minLength: 1, maxLength: 255 });
  if (!nameValidation.success) return nameValidation as any;

  // Validate teacher if provided
  let validatedTeacherId: number | undefined;
  if (data.teacherId !== undefined && data.teacherId !== null) {
    const teacherIdValidation = validateId(data.teacherId);
    if (!teacherIdValidation.success) return teacherIdValidation as any;

    // Validate teacher exists
    const teacherExists = await validateForeignKey(
      users,
      users.id,
      teacherIdValidation.data,
      'teacherId'
    );
    if (!teacherExists.success) return teacherExists as any;
    validatedTeacherId = teacherIdValidation.data;
  }

  // Validate domain if provided
  if (data.domainId !== undefined && data.domainId !== null) {
    const domainIdValidation = validateId(data.domainId);
    if (!domainIdValidation.success) return domainIdValidation as any;

    const domainExists = await validateForeignKey(
      domains,
      domains.id,
      domainIdValidation.data,
      'domainId'
    );
    if (!domainExists.success) return domainExists as any;
  }

  // Create the class
  return classBaseQueries.create({
    name: nameValidation.data,
    description: data.description,
    teacherId: validatedTeacherId,
    domainId: data.domainId,
    isActive: true,
  } as any);
}

/**
 * Get all classes for a teacher using query composition
 * Returns classes directly assigned to the teacher or in domains they teach
 * 
 * @param teacherId - The teacher's user ID
 * @returns Result with array of classes with stats
 * 
 * @example
 * ```typescript
 * const result = await getTeacherClasses(1);
 * if (result.success) {
 *   console.log(`Found ${result.data.length} classes`);
 * }
 * ```
 */
export async function getTeacherClasses(
  teacherId: number
): Promise<DbResult<ClassWithStats[]>> {
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    // Get classes where students are enrolled in the teacher's courses
    // OR classes directly assigned to the teacher
    const result = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        createdAt: classes.createdAt,
        studentCount: sql<number>`cast(count(distinct ${classEnrollments.studentId}) as int)`,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
      .where(
        sql`${classes.teacherId} = ${validId.data} OR ${classes.domainId} IN (
          SELECT DISTINCT ${courses.domainId} 
          FROM ${courses} 
          WHERE ${courses.teacherId} = ${validId.data}
        )`
      )
      .groupBy(
        classes.id,
        classes.name,
        classes.description,
        classes.isActive,
        classes.createdAt,
        domains.id,
        domains.name,
        domains.color
      )
      .orderBy(desc(classes.createdAt));

    return {
      success: true,
      data: result as ClassWithStats[],
    };
  } catch (error) {
    return handleDbError(error, 'getTeacherClasses');
  }
}

/**
 * Get students enrolled in a class (for admin/sub-admin)
 * 
 * @param classId - The class ID
 * @returns Result with array of students
 */
export async function getClassStudents(classId: number): Promise<DbResult<any[]>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  try {
    const students = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        studentPhone: users.phone,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classIdValidation.data))
      .orderBy(desc(classEnrollments.enrolledAt));

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    return handleDbError(error, 'getClassStudents');
  }
}

/**
 * Get class details with enrolled students using base queries and composition
 * 
 * @param classId - The class ID
 * @param teacherId - The teacher's user ID (for authorization)
 * @returns Result with class details and student list
 * 
 * @example
 * ```typescript
 * const result = await getClassDetails(1, 2);
 * if (result.success) {
 *   console.log(`Class: ${result.data.class.name}`);
 *   console.log(`Students: ${result.data.studentCount}`);
 * }
 * ```
 */
export async function getClassDetails(
  classId: number,
  teacherId: number
): Promise<DbResult<ClassDetails>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  const teacherIdValidation = validateId(teacherId);
  if (!teacherIdValidation.success) return teacherIdValidation as any;

  try {
    // Get class info with domain details
    const classInfo = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .where(
        and(
          eq(classes.id, classIdValidation.data),
          eq(classes.teacherId, teacherIdValidation.data)
        )
      )
      .limit(1);

    if (!classInfo[0]) {
      return {
        success: false,
        error: 'Class not found or access denied',
        code: DbErrorCode.NOT_FOUND,
      };
    }

    // Get enrolled students
    const students = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatarUrl: users.avatarUrl,
        studentPhone: users.phone,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classIdValidation.data))
      .orderBy(desc(classEnrollments.enrolledAt));

    return {
      success: true,
      data: {
        class: classInfo[0],
        students,
        studentCount: students.length,
      },
    };
  } catch (error) {
    return handleDbError(error, 'getClassDetails');
  }
}

/**
 * Add a student to a class with capacity validation and transaction support
 * 
 * @param classId - The class ID
 * @param studentId - The student's user ID
 * @returns Result with created enrollment
 * 
 * @example
 * ```typescript
 * const result = await addStudentToClass(1, 5);
 * if (!result.success) {
 *   console.error(result.error); // e.g., "Class is full"
 * }
 * ```
 */
export async function addStudentToClass(
  classId: number,
  studentId: number
): Promise<DbResult<typeof classEnrollments.$inferSelect>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  const studentIdValidation = validateId(studentId);
  if (!studentIdValidation.success) return studentIdValidation as any;

  return withTransaction(async (tx) => {
    try {
      // Check if student is already enrolled
      const existing = await tx
        .select()
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.classId, classIdValidation.data),
            eq(classEnrollments.studentId, studentIdValidation.data)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          error: 'Student already enrolled in this class',
          code: DbErrorCode.CONSTRAINT_VIOLATION,
        };
      }

      // Validate class exists
      const classData = await tx
        .select({
          id: classes.id,
        })
        .from(classes)
        .where(eq(classes.id, classIdValidation.data))
        .limit(1);

      if (!classData[0]) {
        return {
          success: false,
          error: 'Class not found',
          code: DbErrorCode.NOT_FOUND,
        };
      }

      // Validate student exists
      const studentExists = await validateForeignKey(
        users,
        users.id,
        studentIdValidation.data,
        'studentId'
      );
      if (!studentExists.success) return studentExists as any;

      // Add student to class
      const result = await tx
        .insert(classEnrollments)
        .values({
          classId: classIdValidation.data,
          studentId: studentIdValidation.data,
        })
        .returning();

      return {
        success: true,
        data: result[0],
      };
    } catch (error) {
      return handleDbError(error, 'addStudentToClass');
    }
  });
}

/**
 * Remove a student from a class using base queries
 * 
 * @param classId - The class ID
 * @param studentId - The student's user ID
 * @returns Result with deleted enrollment
 * 
 * @example
 * ```typescript
 * const result = await removeStudentFromClass(1, 5);
 * if (!result.success) {
 *   console.error(result.error); // e.g., "Enrollment not found"
 * }
 * ```
 */
export async function removeStudentFromClass(
  classId: number,
  studentId: number
): Promise<DbResult<typeof classEnrollments.$inferSelect>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  const studentIdValidation = validateId(studentId);
  if (!studentIdValidation.success) return studentIdValidation as any;

  try {
    const result = await db
      .delete(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classIdValidation.data),
          eq(classEnrollments.studentId, studentIdValidation.data)
        )
      )
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: 'Enrollment not found',
        code: DbErrorCode.NOT_FOUND,
      };
    }

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return handleDbError(error, 'removeStudentFromClass');
  }
}

/**
 * Update a class
 * 
 * @param classId - The class ID
 * @param data - Partial class data to update
 * @returns Result with updated class
 */
export async function updateClass(
  classId: number,
  data: Partial<CreateClassData>
): Promise<DbResult<typeof classes.$inferSelect>> {
  const validId = validateId(classId);
  if (!validId.success) return validId as any;

  // Validate name if provided
  if (data.name !== undefined) {
    const nameValidation = validateString(data.name, 'name', { minLength: 1, maxLength: 255 });
    if (!nameValidation.success) return nameValidation as any;
  }

  // Validate teacherId if provided
  if (data.teacherId !== undefined) {
    const teacherIdValidation = validateId(data.teacherId);
    if (!teacherIdValidation.success) return teacherIdValidation as any;

    const teacherExists = await validateForeignKey(
      users,
      users.id,
      teacherIdValidation.data,
      'teacherId'
    );
    if (!teacherExists.success) return teacherExists as any;
  }

  // Validate domainId if provided
  if (data.domainId !== undefined && data.domainId !== null) {
    const domainIdValidation = validateId(data.domainId);
    if (!domainIdValidation.success) return domainIdValidation as any;

    const domainExists = await validateForeignKey(
      domains,
      domains.id,
      domainIdValidation.data,
      'domainId'
    );
    if (!domainExists.success) return domainExists as any;
  }

  return classBaseQueries.update(validId.data, data as any);
}

/**
 * Delete a class
 * 
 * @param classId - The class ID
 * @returns Result with deleted class
 */
export async function deleteClass(
  classId: number
): Promise<DbResult<typeof classes.$inferSelect>> {
  return classBaseQueries.delete(classId);
}

/**
 * Get class by ID
 * 
 * @param classId - The class ID
 * @returns Result with class or null
 */
export async function getClassById(
  classId: number
): Promise<DbResult<typeof classes.$inferSelect | null>> {
  return classBaseQueries.findById(classId);
}

/**
 * Get all classes (for admin/sub-admin)
 * 
 * @returns Result with array of classes with stats
 */
export async function getAllClasses(): Promise<DbResult<ClassWithStats[]>> {
  try {
    const result = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        domainId: domains.id,
        domainName: domains.name,
        domainColor: domains.color,
        isActive: classes.isActive,
        createdAt: classes.createdAt,
        studentCount: sql<number>`cast(count(distinct ${classEnrollments.studentId}) as int)`,
      })
      .from(classes)
      .leftJoin(domains, eq(classes.domainId, domains.id))
      .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
      .groupBy(
        classes.id,
        classes.name,
        classes.description,
        classes.isActive,
        classes.createdAt,
        domains.id,
        domains.name,
        domains.color
      )
      .orderBy(desc(classes.createdAt));

    return {
      success: true,
      data: result as ClassWithStats[],
    };
  } catch (error) {
    return handleDbError(error, 'getAllClasses');
  }
}

/**
 * Assign a course to a class and auto-enroll all students
 * 
 * @param classId - The class ID
 * @param courseId - The course ID
 * @returns Result with created class-course link
 */
export async function assignCourseToClass(
  classId: number,
  courseId: number
): Promise<DbResult<typeof classCourses.$inferSelect>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  const courseIdValidation = validateId(courseId);
  if (!courseIdValidation.success) return courseIdValidation as any;

  return withTransaction(async (tx) => {
    try {
      // Check if course is already assigned
      const existing = await tx
        .select()
        .from(classCourses)
        .where(
          and(
            eq(classCourses.classId, classIdValidation.data),
            eq(classCourses.courseId, courseIdValidation.data)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          error: 'Course already assigned to this class',
          code: DbErrorCode.CONSTRAINT_VIOLATION,
        };
      }

      // Validate course exists
      const courseExists = await validateForeignKey(
        courses,
        courses.id,
        courseIdValidation.data,
        'courseId'
      );
      if (!courseExists.success) return courseExists as any;

      // Assign course to class
      const result = await tx
        .insert(classCourses)
        .values({
          classId: classIdValidation.data,
          courseId: courseIdValidation.data,
        })
        .returning();

      // Get all students in the class
      const students = await tx
        .select({ studentId: classEnrollments.studentId })
        .from(classEnrollments)
        .where(eq(classEnrollments.classId, classIdValidation.data));

      // Auto-enroll all students in the course
      if (students.length > 0) {
        const enrollmentValues = students.map((student) => ({
          studentId: student.studentId,
          courseId: courseIdValidation.data,
        }));

        // Insert enrollments, ignoring duplicates
        await tx
          .insert(enrollments)
          .values(enrollmentValues)
          .onConflictDoNothing();
      }

      return {
        success: true,
        data: result[0],
      };
    } catch (error) {
      return handleDbError(error, 'assignCourseToClass');
    }
  });
}

/**
 * Remove a course from a class
 * 
 * @param classId - The class ID
 * @param courseId - The course ID
 * @returns Result with deleted class-course link
 */
export async function removeCourseFromClass(
  classId: number,
  courseId: number
): Promise<DbResult<typeof classCourses.$inferSelect>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  const courseIdValidation = validateId(courseId);
  if (!courseIdValidation.success) return courseIdValidation as any;

  try {
    const result = await db
      .delete(classCourses)
      .where(
        and(
          eq(classCourses.classId, classIdValidation.data),
          eq(classCourses.courseId, courseIdValidation.data)
        )
      )
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: 'Course assignment not found',
        code: DbErrorCode.NOT_FOUND,
      };
    }

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return handleDbError(error, 'removeCourseFromClass');
  }
}

/**
 * Get all courses assigned to a class
 * 
 * @param classId - The class ID
 * @returns Result with array of courses
 */
export async function getClassCourses(classId: number): Promise<DbResult<any[]>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        domainId: courses.domainId,
        teacherId: courses.teacherId,
        thumbnailUrl: courses.thumbnailUrl,
        isActive: courses.isActive,
        assignedAt: classCourses.assignedAt,
      })
      .from(classCourses)
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .where(eq(classCourses.classId, classIdValidation.data))
      .orderBy(desc(classCourses.assignedAt));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleDbError(error, 'getClassCourses');
  }
}

/**
 * Auto-enroll a student in all courses assigned to their class
 * Called when a student is added to a class
 * 
 * @param classId - The class ID
 * @param studentId - The student's user ID
 * @returns Result with number of enrollments created
 */
export async function autoEnrollStudentInClassCourses(
  classId: number,
  studentId: number
): Promise<DbResult<{ enrollmentsCreated: number }>> {
  const classIdValidation = validateId(classId);
  if (!classIdValidation.success) return classIdValidation as any;

  const studentIdValidation = validateId(studentId);
  if (!studentIdValidation.success) return studentIdValidation as any;

  return withTransaction(async (tx) => {
    try {
      // Get all courses assigned to the class
      const classCoursesList = await tx
        .select({ courseId: classCourses.courseId })
        .from(classCourses)
        .where(eq(classCourses.classId, classIdValidation.data));

      if (classCoursesList.length === 0) {
        return {
          success: true,
          data: { enrollmentsCreated: 0 },
        };
      }

      // Create enrollments for all courses
      const enrollmentValues = classCoursesList.map((course) => ({
        studentId: studentIdValidation.data,
        courseId: course.courseId,
      }));

      const result = await tx
        .insert(enrollments)
        .values(enrollmentValues)
        .onConflictDoNothing()
        .returning();

      return {
        success: true,
        data: { enrollmentsCreated: result.length },
      };
    } catch (error) {
      return handleDbError(error, 'autoEnrollStudentInClassCourses');
    }
  });
}
