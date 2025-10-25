import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/auth";
import { reorderChapters } from "@/lib/db/chapter-queries";
import { z } from "zod";

// Schema for reorder request
const reorderChaptersSchema = z.object({
  chapterIds: z.array(z.number().int().positive()).min(1),
});

/**
 * POST /api/modules/[id]/chapters/reorder
 * Reorder chapters within a module
 * @auth ADMIN only
 * @body { chapterIds: number[] } - Array of chapter IDs in desired order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    // Enforce ADMIN-only access
    await requireAdmin();

    const moduleId = parseInt(params.moduleId);
    if (isNaN(moduleId)) {
      return NextResponse.json(
        { error: "Invalid module ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = reorderChaptersSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { chapterIds } = validationResult.data;

    // Reorder chapters within the module
    const result = await reorderChapters(moduleId, chapterIds);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.data.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "[POST /api/modules/[id]/chapters/reorder] Error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to reorder chapters" },
      { status: 500 }
    );
  }
}
