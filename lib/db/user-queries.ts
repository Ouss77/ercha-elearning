import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, enrollments, courses } from "@/drizzle/schema";
import { mapUserFromDb, mapUserToDb } from "./mappers";
import type { User } from "@/types/user";
import { createBaseQueries } from "./base-queries";
import { DbResult, DbErrorCode } from "./types";
import { handleDbError } from "./error-handler";
import { validateId, validateEmail, validateRequired, validateEnum } from "./validation";

// Create base query operations for users table
const userBaseQueries = createBaseQueries(users, users.id);

/**
 * Get a user by email address
 * 
 * @param email - The user's email address
 * @returns Result with user or null if not found
 * 
 * @example
 * ```typescript
 * const result = await getUserByEmail('user@example.com');
 * if (result.success && result.data) {
 *   console.log('User found:', result.data.name);
 * }
 * ```
 */
export async function getUserByEmail(email: string): Promise<DbResult<User | null>> {
  // Validate email format
  const validEmail = validateEmail(email);
  if (!validEmail.success) return validEmail as any;

  try {
    const result = await userBaseQueries.findOne(eq(users.email, validEmail.data));
    if (!result.success) return result;

    const mappedUser = mapUserFromDb(result.data);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error, 'getUserByEmail');
  }
}

/**
 * Create a new user with validation
 * 
 * @param data - User data to create
 * @returns Result with created user
 * 
 * @example
 * ```typescript
 * const result = await createUser({
 *   email: 'user@example.com',
 *   password: 'hashedPassword',
 *   name: 'John Doe',
 *   role: 'STUDENT'
 * });
 * ```
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN";
  photoUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  bio?: string | null;
  isActive?: boolean;
}): Promise<DbResult<User>> {
  // Validate required fields
  const validEmail = validateEmail(data.email);
  if (!validEmail.success) return validEmail as any;

  const validPassword = validateRequired(data.password, 'password');
  if (!validPassword.success) return validPassword as any;

  const validName = validateRequired(data.name, 'name');
  if (!validName.success) return validName as any;

  // Validate role if provided
  if (data.role) {
    const validRole = validateEnum(data.role, ["STUDENT", "TRAINER", "SUB_ADMIN", "ADMIN"] as const, 'role');
    if (!validRole.success) return validRole as any;
  }

  try {
    // Map application data to database format
    const dbData = mapUserToDb(data);

    const insertData: any = {
      email: validEmail.data,
      password: validPassword.data,
      name: validName.data,
      role: data.role || "STUDENT",
      avatarUrl: dbData.avatarUrl,
      isActive: data.isActive ?? true,
      country: data.country || "Morocco",
    };

    // Add optional fields if they exist
    if (data.phone) insertData.phone = data.phone;
    if (data.dateOfBirth) insertData.dateOfBirth = data.dateOfBirth;
    if (data.address) insertData.address = data.address;
    if (data.city) insertData.city = data.city;
    if (data.postalCode) insertData.postalCode = data.postalCode;
    if (data.bio) insertData.bio = data.bio;

    const result = await userBaseQueries.create(insertData);
    if (!result.success) return result;

    const mappedUser = mapUserFromDb(result.data);
    if (!mappedUser) {
      return {
        success: false,
        error: 'Failed to map created user',
        code: DbErrorCode.DATABASE_ERROR,
      };
    }

    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error, 'createUser');
  }
}

/**
 * Get a user by ID
 * 
 * @param id - The user ID
 * @returns Result with user or null if not found
 * 
 * @example
 * ```typescript
 * const result = await getUserById(1);
 * if (result.success && result.data) {
 *   console.log('User:', result.data.name);
 * }
 * ```
 */
export async function getUserById(id: number): Promise<DbResult<User | null>> {
  // Validate ID
  const validId = validateId(id);
  if (!validId.success) return validId as any;

  try {
    const result = await userBaseQueries.findById(validId.data);
    if (!result.success) return result;

    const mappedUser = mapUserFromDb(result.data);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error, 'getUserById');
  }
}

/**
 * Get all users with optional role filtering and their enrolled courses
 * 
 * @param roleFilter - Optional role to filter by
 * @returns Result with array of users with their enrolled courses
 * 
 * @example
 * ```typescript
 * const result = await getAllUsers('STUDENT');
 * if (result.success) {
 *   console.log('Students:', result.data.length);
 * }
 * ```
 */
export async function getAllUsers(
  roleFilter?: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN"
): Promise<DbResult<Array<User & { enrolledCourses: string[] }>>> {
  // Validate role filter if provided
  if (roleFilter) {
    const validRole = validateEnum(roleFilter, ["STUDENT", "TRAINER", "SUB_ADMIN", "ADMIN"] as const, 'roleFilter');
    if (!validRole.success) return validRole as any;
  }

  try {
    // Get all users with optional role filter using base queries
    const usersResult = roleFilter
      ? await userBaseQueries.findMany(eq(users.role, roleFilter))
      : await userBaseQueries.findMany();

    if (!usersResult.success) return usersResult as any;

    // For each user, get their enrolled courses and teaching courses
    // This uses query composition to build the course data
    const usersWithCourses = await Promise.all(
      usersResult.data.map(async (user) => {
        const courseSlugs: string[] = [];

        // Get courses the user is enrolled in (as a student)
        if (user.role === "STUDENT" || user.role === "TRAINER") {
          const enrolledCourses = await db
            .select({ slug: courses.slug })
            .from(enrollments)
            .innerJoin(courses, eq(enrollments.courseId, courses.id))
            .where(eq(enrollments.studentId, user.id));

          courseSlugs.push(...enrolledCourses.map(c => c.slug));
        }

        // Get courses the user is teaching (as a trainer)
        if (user.role === "TRAINER") {
          const teachingCourses = await db
            .select({ slug: courses.slug })
            .from(courses)
            .where(eq(courses.teacherId, user.id));

          courseSlugs.push(...teachingCourses.map(c => c.slug));
        }

        // Remove duplicates
        const uniqueSlugs = [...new Set(courseSlugs)];

        const mappedUser = mapUserFromDb(user);
        return mappedUser ? { ...mappedUser, enrolledCourses: uniqueSlugs } : null;
      })
    );

    const filteredUsers = usersWithCourses.filter(
      (u): u is User & { enrolledCourses: string[] } => u !== null
    );
    
    return { success: true, data: filteredUsers };
  } catch (error) {
    return handleDbError(error, 'getAllUsers');
  }
}

/**
 * Update a user by ID with validation
 * 
 * @param id - The user ID
 * @param data - Partial user data to update
 * @returns Result with updated user
 * 
 * @example
 * ```typescript
 * const result = await updateUser(1, {
 *   name: 'Jane Doe',
 *   isActive: false
 * });
 * ```
 */
export async function updateUser(
  id: number,
  data: Partial<{
    email: string;
    password: string;
    name: string;
    role: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN";
    photoUrl: string | null;
    isActive: boolean;
    phone: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    bio: string | null;
  }>
): Promise<DbResult<User>> {
  // Validate ID
  const validId = validateId(id);
  if (!validId.success) return validId as any;

  // Validate email if provided
  if (data.email) {
    const validEmail = validateEmail(data.email);
    if (!validEmail.success) return validEmail as any;
    data.email = validEmail.data;
  }

  // Validate role if provided
  if (data.role) {
    const validRole = validateEnum(data.role, ["STUDENT", "TRAINER", "SUB_ADMIN", "ADMIN"] as const, 'role');
    if (!validRole.success) return validRole as any;
  }

  try {
    // Map application data to database format
    const dbData = mapUserToDb(data);

    const result = await userBaseQueries.update(validId.data, dbData);
    if (!result.success) return result;

    const mappedUser = mapUserFromDb(result.data);
    if (!mappedUser) {
      return {
        success: false,
        error: 'Failed to map updated user',
        code: DbErrorCode.DATABASE_ERROR,
      };
    }

    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error, 'updateUser');
  }
}

/**
 * Get all teachers (users with TRAINER role)
 * 
 * @returns Result with array of teacher users
 * 
 * @example
 * ```typescript
 * const result = await getTeachers();
 * if (result.success) {
 *   console.log('Teachers:', result.data.length);
 * }
 * ```
 */
export async function getTeachers(): Promise<DbResult<User[]>> {
  try {
    const result = await userBaseQueries.findMany(eq(users.role, "TRAINER"));
    if (!result.success) return result;

    const mappedUsers = result.data
      .map(mapUserFromDb)
      .filter((u): u is User => u !== null);
    
    return { success: true, data: mappedUsers };
  } catch (error) {
    return handleDbError(error, 'getTeachers');
  }
}

/**
 * Validate that a user exists and has the TRAINER role
 * 
 * @param teacherId - The user ID to validate
 * @returns Result with boolean indicating if user is a valid teacher
 * 
 * @example
 * ```typescript
 * const result = await validateTeacherAssignment(5);
 * if (result.success && result.data) {
 *   console.log('Valid teacher');
 * }
 * ```
 */
export async function validateTeacherAssignment(teacherId: number): Promise<DbResult<boolean>> {
  // Validate ID
  const validId = validateId(teacherId);
  if (!validId.success) return validId as any;

  try {
    const result = await userBaseQueries.exists(
      and(eq(users.id, validId.data), eq(users.role, "TRAINER"))!
    );
    
    return result;
  } catch (error) {
    return handleDbError(error, 'validateTeacherAssignment');
  }
}

