import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { createClass, getTeacherClasses } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getTeacherClasses(Number(session.user.id));

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch classes" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, domainId, maxStudents } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const result = await createClass({
      name: name.trim(),
      description: description?.trim() || undefined,
      teacherId: Number(session.user.id),
      domainId: domainId || undefined,
      maxStudents: maxStudents || undefined,
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error || "Failed to create class" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
