import { neon } from "@neondatabase/serverless"

// Get database URL from environment variable
const getDatabaseUrl = () => {
  // Check for various possible environment variable names
  const url =
    process.env.DATABASE_URL 

  if (!url) {
    throw new Error("Database URL not found in environment variables")
  }

  return url
}

// Create SQL client
export const sql = neon(getDatabaseUrl())

// Helper function to handle database errors
export function handleDbError(error: unknown) {
  console.error("[v0] Database error:", error)

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: false,
    error: "An unknown database error occurred",
  }
}

// User database functions
export async function createUser(data: {
  email: string
  password: string
  name: string
  role: "admin" | "teacher" | "student"
}) {
  try {
    const result = await sql`
      INSERT INTO users (email, password, name, role, is_active)
      VALUES (${data.email}, ${data.password}, ${data.name}, ${data.role}, true)
      RETURNING id, email, name, role, is_active, created_at
    `
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, password, name, role, is_active, created_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getUserById(id: number) {
  try {
    const result = await sql`
      SELECT id, email, name, role, is_active, created_at
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    return { success: true, data: result[0] || null }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, name, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `
    return { success: true, data: result }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function updateUserStatus(id: number, isActive: boolean) {
  try {
    const result = await sql`
      UPDATE users
      SET is_active = ${isActive}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, email, name, role, is_active
    `
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDbError(error)
  }
}

export async function deleteUser(id: number) {
  try {
    await sql`
      DELETE FROM users
      WHERE id = ${id}
    `
    return { success: true }
  } catch (error) {
    return handleDbError(error)
  }
}
