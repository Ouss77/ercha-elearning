import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/auth"
import { reorderModules } from "@/lib/db/module-queries"
import { reorderModulesSchema } from "@/lib/schemas/module"
import { z, ZodError } from "zod"

const reorderRequestSchema = reorderModulesSchema.extend({
  courseId: z.number().int().positive()
})

/**
 * POST /api/modules/reorder
 * Reorder modules within a course (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require ADMIN role
    await requireAdmin()

    // Parse and validate request body
    const body = await request.json()
    const { courseId, moduleIds } = reorderRequestSchema.parse(body)

    // Reorder modules
    await reorderModules(courseId, moduleIds)

    return NextResponse.json({
      success: true,
      message: "Modules reordered successfully"
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error reordering modules:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reorder modules" },
      { status: 500 }
    )
  }
}
