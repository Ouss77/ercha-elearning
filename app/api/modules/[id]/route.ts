import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, getCurrentUser } from "@/lib/auth/auth"
import { 
  getModuleById,
  updateModule,
  deleteModule 
} from "@/lib/db/module-queries"
import { updateModuleSchema, moduleIdSchema } from "@/lib/schemas/module"
import { ZodError } from "zod"

/**
 * GET /api/modules/[id]
 * Get a single module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Validate moduleId
    const { id } = moduleIdSchema.parse({ id: params.id })

    // Fetch module
    const moduleData = await getModuleById(id)

    if (!moduleData) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: moduleData
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid module ID", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error fetching module:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch module" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/modules/[id]
 * Update a module (ADMIN only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require ADMIN role
    await requireAdmin()

    // Validate moduleId
    const { id } = moduleIdSchema.parse({ id: params.id })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateModuleSchema.parse(body)

    // Update module
    const updatedModule = await updateModule(id, validatedData)

    if (!updatedModule) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedModule
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating module:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/modules/[id]
 * Delete a module (ADMIN only) - cascade deletes chapters
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require ADMIN role
    await requireAdmin()

    // Validate moduleId
    const { id } = moduleIdSchema.parse({ id: params.id })

    // Delete module
    const deleted = await deleteModule(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully"
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid module ID", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error deleting module:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete module" },
      { status: 500 }
    )
  }
}
