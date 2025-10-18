import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import {
  getChaptersWithContent,
  canViewChapter,
  canManageChapter,
  createChapter,
} from "@/lib/db/chapter-queries"
import { createChapterSchema } from "@/lib/schemas/chapter"
import { ZodError } from "zod"

/**
 * GET /api/courses/[id]/chapters
 * Fetch all chapters for a course with associated content items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate courseId
    const courseId = parseInt(params.id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    // Authorization check - verify user can view chapters for this course
    const hasAccess = await canViewChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to view chapters for this course" },
        { status: 403 }
      )
    }

    // Fetch chapters with content items
    const result = await getChaptersWithContent(courseId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ chapters: result.data }, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching chapters:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/courses/[id]/chapters
 * Create a new chapter for a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate courseId
    const courseId = parseInt(params.id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    console.log(`[POST /api/courses/${courseId}/chapters] User:`, user.id, user.role)

    // Authorization check - verify user can manage chapters for this course
    const hasAccess = await canManageChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to create chapters for this course" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    console.log(`[POST /api/courses/${courseId}/chapters] Request body:`, body)

    const validatedData = createChapterSchema.parse(body)
    console.log(`[POST /api/courses/${courseId}/chapters] Validated data:`, validatedData)

    // Create chapter
    const result = await createChapter(courseId, validatedData)

    if (!result.success) {
      console.error(`[POST /api/courses/${courseId}/chapters] Failed to create chapter:`, result.error)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    console.log(`[POST /api/courses/${courseId}/chapters] Successfully created chapter:`, result.data.id)
    return NextResponse.json({ chapter: result.data }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[POST /api/courses/[id]/chapters] Validation error:", error.errors)
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[POST /api/courses/[id]/chapters] Error creating chapter:", error)
    if (error instanceof Error) {
      console.error("[POST /api/courses/[id]/chapters] Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
