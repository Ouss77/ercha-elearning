import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import {
  getContentItemsByChapterId,
  getCourseIdByChapterId,
  canViewChapter,
  canManageChapter,
  createContentItem,
} from "@/lib/db/chapter-queries"
import { createContentItemSchema } from "@/lib/schemas/chapter"
import { ZodError } from "zod"

/**
 * GET /api/chapters/[id]/content
 * Fetch all content items for a chapter ordered by order_index
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

    // Parse and validate chapterId
    const chapterId = parseInt(params.id, 10)
    if (isNaN(chapterId)) {
      return NextResponse.json({ error: "Invalid chapter ID" }, { status: 400 })
    }

    // Get the course ID for this chapter
    const courseId = await getCourseIdByChapterId(chapterId)
    if (!courseId) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }

    // Authorization check - verify user can view content for this chapter
    const hasAccess = await canViewChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to view content for this chapter" },
        { status: 403 }
      )
    }

    // Fetch content items
    const result = await getContentItemsByChapterId(chapterId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ contentItems: result.data }, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching content items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/chapters/[id]/content
 * Create a new content item for a chapter
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

    // Parse and validate chapterId
    const chapterId = parseInt(params.id, 10)
    if (isNaN(chapterId)) {
      return NextResponse.json({ error: "Invalid chapter ID" }, { status: 400 })
    }

    // Get the course ID for this chapter
    const courseId = await getCourseIdByChapterId(chapterId)
    if (!courseId) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }

    // Authorization check - verify user can manage content for this chapter
    const hasAccess = await canManageChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to create content for this chapter" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createContentItemSchema.parse(body)

    // Create content item
    const result = await createContentItem(chapterId, validatedData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ contentItem: result.data }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error creating content item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
