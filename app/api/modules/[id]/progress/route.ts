/**
 * Module Progress API Endpoint
 * 
 * GET /api/modules/[id]/progress
 * - Students: Get their own progress
 * - Teachers/Admins: Get progress for specified student (query param: studentId)
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { getModuleProgress } from "@/lib/db/module-queries"
import { z } from "zod"

const querySchema = z.object({
  studentId: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }
    
    const moduleId = parseInt(params.moduleId)
    if (isNaN(moduleId)) {
      return NextResponse.json(
        { error: "ID de module invalide" },
        { status: 400 }
      )
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      studentId: searchParams.get("studentId") || undefined,
    })
    
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
    const progress = await getModuleProgress(targetStudentId, moduleId)
    
    if (!progress) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: progress,
    })
  } catch (error) {
    console.error("Error fetching module progress:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la récupération du progrès du module" },
      { status: 500 }
    )
  }
}
