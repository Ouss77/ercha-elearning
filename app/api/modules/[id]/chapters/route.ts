import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/auth";
import {
  getChaptersByModuleId,
  createChapter,
} from "@/lib/db/chapter-queries";
import { createChapterSchema } from "@/lib/schemas/chapter";

/**
 * GET /api/modules/[id]/chapters
 * List all chapters for a module
 * @auth Any authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleId = parseInt(params.moduleId);
    if (isNaN(moduleId)) {
      return NextResponse.json(
        { error: "Invalid module ID" },
        { status: 400 }
      );
    }

    const result = await getChaptersByModuleId(moduleId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[GET /api/modules/[id]/chapters] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/modules/[id]/chapters
 * Create a new chapter within a module
 * @auth ADMIN only (TRAINER access removed)
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

    const body = await request.json();

    // Validate request body
    const validationResult = createChapterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Create the chapter
    const result = await createChapter(moduleId, validationResult.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/modules/[id]/chapters] Error:", error);

    // Handle authorization errors
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
