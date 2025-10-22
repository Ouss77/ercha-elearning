import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { createClass, getAllClasses } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getAllClasses();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch classes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ classes: result.data });
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
    const user = await getCurrentUser();

    if (!user || !["ADMIN", "SUB_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, teacherId, domainId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const result = await createClass({
      name: name.trim(),
      description: description?.trim() || undefined,
      teacherId: teacherId ? Number(teacherId) : undefined,
      domainId: domainId ? Number(domainId) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create class" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Class created successfully", class: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
