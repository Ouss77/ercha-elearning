import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { reorderModules } from "@/lib/db/module-queries"
import { getCourseById } from "@/lib/db/queries"
import { z } from "zod"

/**
 * Request body schema for module reordering
 */
const reorderModulesSchema = z.object({
  moduleIds: z.array(z.number().int().positive()).min(1, "Au moins un module requis"),
})

/**
 * POST /api/courses/[id]/modules/reorder
 * Reorder modules within a course
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.3, 8.4
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Authorization check - only admins can reorder modules
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Validate and parse course ID
    const courseId = parseInt(params.id)
    if (isNaN(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: "ID de cours invalide" },
        { status: 400 }
      )
    }

    // Verify course exists
    const courseResult = await getCourseById(courseId)
    if (!courseResult.success || !courseResult.data) {
      return NextResponse.json(
        { error: "Cours introuvable" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = reorderModulesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { moduleIds } = validation.data

    // Reorder modules
    const success = await reorderModules(courseId, moduleIds)

    if (!success) {
      return NextResponse.json(
        { error: "Échec de la réorganisation des modules" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Modules réorganisés avec succès",
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API] Error reordering modules:", error)
    return NextResponse.json(
      { error: "Erreur lors de la réorganisation des modules" },
      { status: 500 }
    )
  }
}
