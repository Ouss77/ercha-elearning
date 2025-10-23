import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db/db";
import { enrollments, classEnrollments } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

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

    // Get all student IDs in this class
    const classStudents = await db
      .select({ studentId: classEnrollments.studentId })
      .from(classEnrollments)
      .where(eq(classEnrollments.classId, classId));

    if (classStudents.length === 0) {
      return NextResponse.json({ enrollmentCount: 0 });
    }

    const studentIds = classStudents.map(s => s.studentId);

    // Count course enrollments for these students
    const courseEnrollments = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(inArray(enrollments.studentId, studentIds));

    return NextResponse.json({ 
      enrollmentCount: courseEnrollments.length 
    });
  } catch (error) {
    console.error("Error fetching enrollment count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
