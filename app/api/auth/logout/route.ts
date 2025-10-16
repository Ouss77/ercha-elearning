import { NextResponse } from "next/server"
import { clearAuthCookie, clearSession } from "@/lib/auth/auth"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (token) {
      clearSession(token)
    }

    await clearAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
