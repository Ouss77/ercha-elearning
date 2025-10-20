import { eq, and, sql } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { users, enrollments, courses } from "@/drizzle/schema";
import { mapUserFromDb, mapUserToDb } from "./mappers";
import type { User } from "@/types/user";

// User query functions
export async function getUserByEmail(email: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const mappedUser = mapUserFromDb(result[0]);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

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
}) {
  try {
    // Map application data to database format
    const dbData = mapUserToDb(data);

    const insertData: any = {
      email: data.email,
      password: data.password,
      name: data.name,
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

    const result = await db.insert(users).values(insertData).returning();

    const mappedUser = mapUserFromDb(result[0]);
    return { success: true as const, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getUserById(id: number) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    const mappedUser = mapUserFromDb(result[0]);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getAllUsers(roleFilter?: "STUDENT" | "TRAINER" | "SUB_ADMIN" | "ADMIN") {
  try {
    // First get all users
    const query = roleFilter
      ? db.select().from(users).where(eq(users.role, roleFilter))
      : db.select().from(users);

    const result = await query;
    
    // For each user, get their enrolled courses and teaching courses
    const usersWithCourses = await Promise.all(
      result.map(async (user) => {
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

    const filteredUsers = usersWithCourses.filter((u): u is User & { enrolledCourses: string[] } => u !== null);
    return { success: true as const, data: filteredUsers };
  } catch (error) {
    return handleDbError(error);
  }
}

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
) {
  try {
    // Map application data to database format
    const dbData = mapUserToDb(data);

    const result = await db
      .update(users)
      .set(dbData)
      .where(eq(users.id, id))
      .returning();

    const mappedUser = mapUserFromDb(result[0]);
    return { success: true, data: mappedUser };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getTeachers() {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, "TRAINER"));

    const mappedUsers = result
      .map(mapUserFromDb)
      .filter((u): u is User => u !== null);
    return { success: true, data: mappedUsers };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function validateTeacherAssignment(teacherId: number) {
  try {
    const result = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.id, teacherId), eq(users.role, "TRAINER")))
      .limit(1);

    return { success: true, data: result.length > 0 };
  } catch (error) {
    return handleDbError(error);
  }
}

