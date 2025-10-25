import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, getCurrentUser } from "@/lib/auth/auth"
import { 
  getModulesByCourseId, 
  getModulesWithChapters,
  createModule 
} from "@/lib/db/module-queries"
import { createModuleSchema, courseIdSchema } from "@/lib/schemas/module"
import { ZodError } from "zod"

/**
 * GET /api/courses/[id]/modules
 * List all modules for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
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

    // Validate courseId
    const { courseId } = courseIdSchema.parse({ courseId: params.courseId })

    // Check if we should include chapters
    const { searchParams } = new URL(request.url)
    const includeChapters = searchParams.get("includeChapters") === "true"

    // Fetch modules
    const modules = includeChapters
      ? await getModulesWithChapters(courseId)
      : await getModulesByCourseId(courseId)

    return NextResponse.json({
      success: true,
      data: modules
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid course ID", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error fetching modules:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/modules
 * Create a new module (ADMIN only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Require ADMIN role
    await requireAdmin()

    // Validate courseId
    const { courseId } = courseIdSchema.parse({ courseId: params.courseId })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createModuleSchema.parse(body)

    // Create module
    const newModule = await createModule(courseId, validatedData)

    return NextResponse.json(
      { success: true, data: newModule },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating module:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    )
  }
}
