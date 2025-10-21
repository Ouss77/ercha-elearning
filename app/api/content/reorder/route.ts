import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import {
  getCourseIdByChapterId,
  canManageChapter,
  reorderContentItems,
} from "@/lib/db/chapter-queries"
import { reorderContentItemsSchema } from "@/lib/schemas/chapter"
import { ZodError } from "zod"

/**
 * PATCH /api/content/reorder
 * Reorder content items within a chapter
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
    const validatedData = reorderContentItemsSchema.parse(body)

    // Get the course ID for this chapter
    const courseId = await getCourseIdByChapterId(validatedData.chapterId)
    if (!courseId) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }

    // Authorization check - verify user can manage content for this course
    const hasAccess = await canManageChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to reorder content items for this chapter" },
        { status: 403 }
      )
    }

    // Reorder content items
    const result = await reorderContentItems(
      validatedData.chapterId,
      validatedData.contentItemIds
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error reordering content items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
