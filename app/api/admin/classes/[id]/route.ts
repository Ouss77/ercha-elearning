import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { getClassById, updateClass, deleteClass } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const result = await getClassById(classId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch class" },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ class: result.data });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, teacherId, domainId, maxStudents, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (teacherId !== undefined) updateData.teacherId = Number(teacherId);
    if (domainId !== undefined) updateData.domainId = domainId ? Number(domainId) : null;
    if (maxStudents !== undefined) updateData.maxStudents = maxStudents ? Number(maxStudents) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const result = await updateClass(classId, updateData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update class" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Class updated successfully",
      class: result.data,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const result = await deleteClass(classId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete class" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}