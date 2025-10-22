// Re-export Drizzle-based functions for backward compatibility
export { db, handleDbError } from "./index"
export {
  getUserByEmail,
  createUser,
  getUserById,
  getAllUsers,
} from "./queries"

// Legacy functions that need to be migrated or removed
// These are kept for backward compatibility but should be updated to use Drizzle
import { db } from "./index"
import { handleDbError } from '@/lib/db/error-handler';
import { users } from "@/drizzle/schema"
import { eq, and, ne } from "drizzle-orm"

export async function updateUserStatus(id: number, isActive: boolean) {
  try {
    const result = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    if (!result || result.length === 0) {
      return { success: false, error: "User not found" }
    }
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteUser(id: number) {
  try {
    // Fetch target user
    const target = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (!target || target.length === 0) {
      return { success: false, error: "User not found" }
    }
    const targetUser = target[0]

    // If target is ADMIN, ensure there is at least one other active admin
    if (targetUser.role === "ADMIN") {
      const otherActiveAdmins = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, "ADMIN"), eq(users.isActive, true), ne(users.id, id)))

      if ((otherActiveAdmins?.length || 0) === 0 && targetUser.isActive) {
        return { success: false, error: "Cannot delete the last admin user" }
      }
    }

    // Hard delete: permanently remove user from database
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning()

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}
