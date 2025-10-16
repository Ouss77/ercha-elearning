import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { getUserByEmail } from "@/lib/db/queries"

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

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        // getUserByEmail returns user with photoUrl (mapped from avatar_url in DB)
        // All required fields: id, email, name, role, avatar_url (as photoUrl) are accessible
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.photoUrl || undefined
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
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
