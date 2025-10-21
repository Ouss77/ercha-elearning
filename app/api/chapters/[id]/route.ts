import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import {
  getChapterById,
  getCourseIdByChapterId,
  canManageChapter,
  updateChapter,
  deleteChapter,
} from "@/lib/db/chapter-queries";
import { updateChapterSchema } from "@/lib/schemas/chapter";
import { ZodError } from "zod";

/**
 * PATCH /api/chapters/[id]
 * Update chapter details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate chapter ID
    const chapterId = parseInt(params.id, 10);
    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    // Get chapter to verify it exists and get course ID
    const chapterResult = await getChapterById(chapterId);
    if (!chapterResult.success || !chapterResult.data) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const courseId = chapterResult.data.courseId;

    // Authorization check - verify user can manage chapters for this course
    const hasAccess = await canManageChapter(
      parseInt(user.id),
      user.role as any,
      courseId!
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to update this chapter" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateChapterSchema.parse(body);

    // Update chapter
    const result = await updateChapter(chapterId, validatedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ chapter: result.data }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[API] Error updating chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chapters/[id]
 * Delete a chapter and all its content items (cascade)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate chapter ID
    const chapterId = parseInt(params.id, 10);
    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    // Get chapter to verify it exists and get course ID
    const chapterResult = await getChapterById(chapterId);
    if (!chapterResult.success || !chapterResult.data) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const courseId = chapterResult.data.courseId;

    // Authorization check - verify user can manage chapters for this course
    const hasAccess = await canManageChapter(
      parseInt(user.id),
      user.role as any,
      courseId!
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to delete this chapter" },
        { status: 403 }
      );
    }

    // Delete chapter (cascade delete handled by database)
    const result = await deleteChapter(chapterId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Chapter deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
