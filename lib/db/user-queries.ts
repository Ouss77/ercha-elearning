import { eq, and } from "drizzle-orm";
import { db, handleDbError } from "./index";
import { users } from "@/drizzle/schema";
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
    const query = roleFilter
      ? db.select().from(users).where(eq(users.role, roleFilter))
      : db.select().from(users);

    const result = await query;
    const mappedUsers = result
      .map(mapUserFromDb)
      .filter((u): u is User => u !== null);
    return { success: true as const, data: mappedUsers };
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

