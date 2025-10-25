import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/auth";
import { moveChapter, getChapterById } from "@/lib/db/chapter-queries";
import { moveChapterSchema } from "@/lib/schemas/chapter";
import { ZodError } from "zod";

/**
 * POST /api/chapters/[id]/move
 * Move a chapter to a different module
 * @auth ADMIN only
 * @body { targetModuleId: number, targetOrderIndex?: number }
 */
export async function POST(
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

    // Verify chapter exists
    const chapterResult = await getChapterById(chapterId);
    if (!chapterResult.success || !chapterResult.data) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = moveChapterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { targetModuleId, targetOrderIndex } = validationResult.data;

    // Move the chapter
    const result = await moveChapter(
      chapterId,
      targetModuleId,
      targetOrderIndex
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "Chapter moved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[POST /api/chapters/[id]/move] Error:", error);
    return NextResponse.json(
      { error: "Failed to move chapter" },
      { status: 500 }
    );
  }
}
