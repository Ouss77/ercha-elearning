import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { updateModule, deleteModule, getModuleById } from "@/lib/db/module-queries"
import { updateModuleSchema } from "@/lib/schemas/module"
import { ZodError } from "zod"

/**
 * PATCH /api/modules/[id]
 * Update an existing module
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.3, 8.4
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Authorization check - only admins can update modules
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Validate and parse module ID
    const moduleId = parseInt(params.id)
    if (isNaN(moduleId) || moduleId <= 0) {
      return NextResponse.json(
        { error: "ID de module invalide" },
        { status: 400 }
      )
    }

    // Verify module exists
    const existingModule = await getModuleById(moduleId)
    if (!existingModule) {
      return NextResponse.json(
        { error: "Module introuvable" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateModuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Update module
    const updatedModule = await updateModule(moduleId, validation.data)

    if (!updatedModule) {
      return NextResponse.json(
        { error: "Échec de la mise à jour du module" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Module mis à jour avec succès",
        module: updatedModule,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error updating module:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du module" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/modules/[id]
 * Delete a module and cascade delete its chapters
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.3, 8.4
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Authorization check - only admins can delete modules
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Validate and parse module ID
    const moduleId = parseInt(params.id)
    if (isNaN(moduleId) || moduleId <= 0) {
      return NextResponse.json(
        { error: "ID de module invalide" },
        { status: 400 }
      )
    }

    // Verify module exists
    const existingModule = await getModuleById(moduleId)
    if (!existingModule) {
      return NextResponse.json(
        { error: "Module introuvable" },
        { status: 404 }
      )
    }

    // Delete module (cascade deletion of chapters handled by database constraints)
    const deleted = await deleteModule(moduleId)

    if (!deleted) {
      return NextResponse.json(
        { error: "Échec de la suppression du module" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Module supprimé avec succès",
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API] Error deleting module:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du module" },
      { status: 500 }
    )
  }
}
