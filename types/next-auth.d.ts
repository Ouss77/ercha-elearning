import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
  }
}

// Updated User interface to match NextAuth session structure
export interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT" | "admin" | "student" | "teacher"
  image?: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}