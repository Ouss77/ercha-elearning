import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "student" | "teacher"
  active: boolean
  created_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Simple session management without JWT
const sessions = new Map<string, { user: User; expires: number }>()

// Generate session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Create session
export function createSession(user: User): string {
  const token = generateSessionToken()
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  sessions.set(token, { user, expires })
  return token
}

// Get session
export function getSession(token: string): User | null {
  const session = sessions.get(token)
  if (!session) return null

  if (Date.now() > session.expires) {
    sessions.delete(token)
    return null
  }

  return session.user
}

// Clear session
export function clearSession(token: string) {
  sessions.delete(token)
}

// Get current user from cookies
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const user = getSession(token)
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Require authentication
export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }

  return user
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
