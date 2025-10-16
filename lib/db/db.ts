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
import { db, handleDbError } from "./index"
import { users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function updateUserStatus(id: number, isActive: boolean) {
  try {
    // Note: The new schema doesn't have is_active field
    // This function is kept for backward compatibility but may need adjustment
    const result = await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id))
    return { success: true }
  } catch (error) {
    return handleDbError(error)
  }
}
