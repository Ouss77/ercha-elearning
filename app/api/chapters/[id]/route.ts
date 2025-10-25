import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/auth";
import {
  getChapterById,
  updateChapter,
  deleteChapter,
} from "@/lib/db/chapter-queries";
import { updateChapterSchema } from "@/lib/schemas/chapter";
import { ZodError } from "zod";

/**
 * PATCH /api/chapters/[id]
 * Update chapter details
 * @auth ADMIN only (TRAINER access removed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Enforce ADMIN-only access
    await requireAdmin();

    // Parse and validate chapter ID
    const chapterId = parseInt(params.id, 10);
    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    // Get chapter to verify it exists
    const chapterResult = await getChapterById(chapterId);
    if (!chapterResult.success || !chapterResult.data) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
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
 * @auth ADMIN only (TRAINER access removed)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Enforce ADMIN-only access
    await requireAdmin();

    // Parse and validate chapter ID
    const chapterId = parseInt(params.id, 10);
    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    // Get chapter to verify it exists
    const chapterResult = await getChapterById(chapterId);
    if (!chapterResult.success || !chapterResult.data) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
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
