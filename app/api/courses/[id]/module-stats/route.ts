import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { getCourseModuleStats } from "@/lib/db/module-queries"

/**
 * GET /api/courses/[id]/module-stats
 * Get module-level statistics for all students in a course
 * @auth TRAINER, ADMIN
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Only trainers and admins can view module stats
    if (user.role !== "TRAINER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const courseId = parseInt(params.courseId, 10)
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "ID de cours invalide" },
        { status: 400 }
      )
    }

    // Get module stats for the course
    const stats = await getCourseModuleStats(courseId)

    return NextResponse.json({
      success: true,
      modules: stats,
    })
  } catch (error) {
    console.error("[API] Error fetching module stats:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
