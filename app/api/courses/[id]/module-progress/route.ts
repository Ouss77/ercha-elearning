/**
 * Course Module Progress API Endpoint
 * 
 * GET /api/courses/[id]/module-progress
 * - Students: Get their own progress across all modules
 * - Teachers/Admins: Get progress for specified student or stats for all students
 *   Query params:
 *   - studentId: Get specific student's progress
 *   - stats: Get teacher view statistics (all students)
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { 
  getModuleProgressForCourse,
  getCourseModuleStats,
} from "@/lib/db/module-queries"
import { z } from "zod"

const querySchema = z.object({
  studentId: z.string().optional(),
  stats: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }
    
    const courseId = parseInt(params.courseId)
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "ID de cours invalide" },
        { status: 400 }
      )
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      studentId: searchParams.get("studentId") || undefined,
      stats: searchParams.get("stats") || undefined,
    })
    
    // Teacher/Admin view: Get stats for all students
    if (query.stats === "true") {
      if (session.user.role !== "ADMIN" && session.user.role !== "TRAINER") {
        return NextResponse.json(
          { error: "Non autorisé - seuls les enseignants et administrateurs peuvent voir les statistiques" },
          { status: 403 }
        )
      }
      
      const stats = await getCourseModuleStats(courseId)
      
      return NextResponse.json({
        success: true,
        data: stats,
      })
    }
    
    // Determine which student's progress to fetch
    let targetStudentId: number
    
    if (query.studentId) {
      // Teachers/Admins can view other students' progress
      if (session.user.role !== "ADMIN" && session.user.role !== "TRAINER") {
        return NextResponse.json(
          { error: "Non autorisé - seuls les enseignants et administrateurs peuvent voir les progrès des autres étudiants" },
          { status: 403 }
        )
      }
      targetStudentId = parseInt(query.studentId)
      if (isNaN(targetStudentId)) {
        return NextResponse.json(
          { error: "ID d'étudiant invalide" },
          { status: 400 }
        )
      }
    } else {
      // Students view their own progress
      targetStudentId = parseInt(session.user.id)
    }
    
    // Fetch progress
    const progress = await getModuleProgressForCourse(targetStudentId, courseId)
    
    return NextResponse.json({
      success: true,
      data: progress,
    })
  } catch (error) {
    console.error("Error fetching course module progress:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la récupération du progrès des modules" },
      { status: 500 }
    )
  }
}
