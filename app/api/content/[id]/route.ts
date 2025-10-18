import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import {
  getContentItemById,
  getCourseIdByContentItemId,
  canManageChapter,
  updateContentItem,
  deleteContentItem,
} from "@/lib/db/chapter-queries"
import { updateContentItemSchema } from "@/lib/schemas/chapter"
import { ZodError } from "zod"

/**
 * PATCH /api/content/[id]
 * Update a content item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate content item ID
    const contentItemId = parseInt(params.id, 10)
    if (isNaN(contentItemId)) {
      return NextResponse.json({ error: "Invalid content item ID" }, { status: 400 })
    }

    // Get the course ID for this content item
    const courseId = await getCourseIdByContentItemId(contentItemId)
    if (!courseId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 })
    }

    // Authorization check - verify user can manage content for this course
    const hasAccess = await canManageChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to update this content item" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateContentItemSchema.parse(body)

    // Update content item
    const result = await updateContentItem(contentItemId, validatedData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ contentItem: result.data }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error updating content item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/content/[id]
 * Delete a content item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate content item ID
    const contentItemId = parseInt(params.id, 10)
    if (isNaN(contentItemId)) {
      return NextResponse.json({ error: "Invalid content item ID" }, { status: 400 })
    }

    // Get the course ID for this content item
    const courseId = await getCourseIdByContentItemId(contentItemId)
    if (!courseId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 })
    }

    // Authorization check - verify user can manage content for this course
    const hasAccess = await canManageChapter(parseInt(user.id), user.role as any, courseId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to delete this content item" },
        { status: 403 }
      )
    }

    // Delete content item (also adjusts order_index of remaining items)
    const result = await deleteContentItem(contentItemId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] Error deleting content item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
