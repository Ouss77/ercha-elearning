import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { removeStudentFromClass } from "@/lib/db/queries";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classId = parseInt(params.id);
    const studentId = parseInt(params.studentId);

    if (isNaN(classId) || isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await removeStudentFromClass(classId, studentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to remove student from class" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Student removed from class successfully",
    });
  } catch (error) {
    console.error("Error removing student from class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}