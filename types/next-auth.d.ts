import "next-auth"
import "next-auth/jwt"
import type { Role } from "@/lib/schemas/user"

declare module "next-auth" {
  interface User {
    role: Role
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      image?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    id: string
  }
}