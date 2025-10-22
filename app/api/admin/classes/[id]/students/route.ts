import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { getClassStudents, addStudentToClass, autoEnrollStudentInClassCourses } from "@/lib/db/queries";

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

    const result = await getClassStudents(classId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch class students" },
        { status: 500 }
      );
    }

    return NextResponse.json({ students: result.data });
  } catch (error) {
    console.error("Error fetching class students:", error);
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
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Add student to class
    const result = await addStudentToClass(classId, Number(studentId));

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to add student to class" },
        { status: 500 }
      );
    }

    // Auto-enroll student in all class courses
    const enrollResult = await autoEnrollStudentInClassCourses(
      classId,
      Number(studentId)
    );

    return NextResponse.json({
      message: "Student added to class successfully",
      enrollment: result.data,
      coursesEnrolled: enrollResult.success ? enrollResult.data.enrollmentsCreated : 0,
    });
  } catch (error) {
    console.error("Error adding student to class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}