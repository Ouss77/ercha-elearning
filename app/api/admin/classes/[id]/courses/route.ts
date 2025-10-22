import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { getClassCourses, assignCourseToClass, removeCourseFromClass } from "@/lib/db/queries";

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

    const result = await getClassCourses(classId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch class courses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ courses: result.data });
  } catch (error) {
    console.error("Error fetching class courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const result = await assignCourseToClass(classId, Number(courseId));

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to assign course to class" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Course assigned to class successfully",
      assignment: result.data,
    });
  } catch (error) {
    console.error("Error assigning course to class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = parseInt(searchParams.get("classId") || "");
    const courseId = parseInt(searchParams.get("courseId") || "");

    if (isNaN(classId) || isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const result = await removeCourseFromClass(classId, courseId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to remove course from class" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Course removed from class successfully",
    });
  } catch (error) {
    console.error("Error removing course from class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}