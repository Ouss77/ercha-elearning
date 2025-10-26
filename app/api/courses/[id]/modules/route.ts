import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { createModule } from "@/lib/db/module-queries"
import { getCourseById } from "@/lib/db/queries"
import { createModuleSchema } from "@/lib/schemas/module"
import { ZodError } from "zod"

/**
 * POST /api/courses/[id]/modules
 * Create a new module for a course
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.3, 8.4
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

    // Authorization check - only admins can create modules
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
    const validation = createModuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Create module
    const module = await createModule(courseId, validation.data)

    return NextResponse.json(
      {
        message: "Module créé avec succès",
        module,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error creating module:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du module" },
      { status: 500 }
    )
  }
}
