import { type NextRequest, NextResponse } from "next/server"
import { createSession, setAuthCookie } from "@/lib/auth/auth"
import { getUserByEmail } from "@/lib/db/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email et mot de passe requis" }, { status: 400 })
    }

    const result = await getUserByEmail(email)

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
    }

    const dbUser = result.data

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Simple password check (in production, use bcrypt)
    if (dbUser.password !== password) {
      return NextResponse.json({ success: false, error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    if (!dbUser.is_active) {
      return NextResponse.json({ success: false, error: "Compte désactivé" }, { status: 403 })
    }

    const user = {
      id: dbUser.id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      active: dbUser.is_active,
      created_at: dbUser.created_at,
    }

    const sessionToken = createSession(user)
    await setAuthCookie(sessionToken)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
