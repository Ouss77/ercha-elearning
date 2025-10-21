import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { canManageChapter, reorderChapters } from "@/lib/db/chapter-queries"
import { reorderChaptersSchema } from "@/lib/schemas/chapter"
import { ZodError } from "zod"

/**
 * PATCH /api/chapters/reorder
 * Reorder chapters within a course
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = reorderChaptersSchema.parse(body)

    const { courseId, chapterIds } = validatedData

    // Authorization check - verify user can manage chapters for this course
    const hasAccess = await canManageChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to reorder chapters for this course" },
        { status: 403 }
      )
    }

    // Reorder chapters
    const result = await reorderChapters(courseId, chapterIds)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: "Chapters reordered successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error reordering chapters:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
