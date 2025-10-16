import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import type { Role } from "@/lib/schemas/user"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  image?: string
}

export type User = AuthUser

// Get current user from NextAuth session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as any,
      image: session.user.image
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Require authentication with role-based access control
export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Normalize roles for comparison (handle both old and new role formats)
    const normalizedUserRole = normalizeRole(user.role)
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole)
    
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      redirect("/unauthorized")
    }
  }

  return user
}

// Helper function to normalize role names for backward compatibility
function normalizeRole(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'ADMIN',
    'teacher': 'TRAINER',
    'student': 'STUDENT',
    'ADMIN': 'ADMIN',
    'TRAINER': 'TRAINER',
    'STUDENT': 'STUDENT',
    'SUB_ADMIN': 'SUB_ADMIN'
  }
  return roleMap[role] || role
}

// Legacy functions for backward compatibility
// These are kept to avoid breaking existing code but use NextAuth internally

// @deprecated Use NextAuth signIn instead
export function createSession(user: AuthUser): string {
  console.warn("createSession is deprecated. Use NextAuth signIn instead.")
  return ""
}

// @deprecated Use NextAuth session instead
export function getSession(token: string): AuthUser | null {
  console.warn("getSession is deprecated. Use getServerSession from NextAuth instead.")
  return null
}

// @deprecated Use NextAuth signOut instead
export function clearSession(token: string) {
  console.warn("clearSession is deprecated. Use NextAuth signOut instead.")
}

// @deprecated NextAuth handles cookies automatically
export async function setAuthCookie(token: string) {
  console.warn("setAuthCookie is deprecated. NextAuth handles cookies automatically.")
}

// @deprecated NextAuth handles cookies automatically
export async function clearAuthCookie() {
  console.warn("clearAuthCookie is deprecated. NextAuth handles cookies automatically.")
}
