import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { getAllCourses } from "@/lib/db/queries"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get all courses
    const result = await getAllCourses()

    if (!result.success) {
      const errorMsg = !result.success && "error" in result ? result.error : "Erreur lors de la récupération des cours"
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    return NextResponse.json({ courses: result.data }, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching courses:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
