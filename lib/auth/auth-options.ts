import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { getUserByEmail, getUserById } from "@/lib/db/queries"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const result = await getUserByEmail(credentials.email)
        
        if (!result.success || !result.data) {
          return null
        }

        const user = result.data

        // Deny sign-in for deactivated users
        if (user.isActive === false) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        // getUserByEmail returns user with avatarUrl from DB
        // All required fields: id, email, name, role, avatarUrl are accessible
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatarUrl || undefined,
          isActive: user.isActive
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
        token.active = (user as any).isActive ?? true
      }
      
      // Check user's active status on every request to ensure real-time logout
      if (token.id) {
        const result = await getUserById(Number(token.id))
        if (result.success && result.data) {
          // Update token with latest active status from database
          token.active = result.data.isActive ?? true
          token.role = result.data.role
        } else {
          // User not found or error - mark as inactive
          token.active = false
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id as string
        ;(session.user as any).active = (token as any).active ?? true
      }
      return session
    }
  },
  pages: {
    signIn: "/connexion",
    error: "/connexion"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
}
