import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { quizAttempts } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { contentId, answers, score, passed } = body;

    // Save the quiz attempt
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        studentId: parseInt(session.user.id),
        quizId: contentId,
        answers,
        score,
        passed,
      })
      .returning();

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json({ error: "contentId requis" }, { status: 400 });
    }

    // Get all attempts for this quiz by this student
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, parseInt(session.user.id)),
          eq(quizAttempts.quizId, parseInt(contentId))
        )
      )
      .orderBy(desc(quizAttempts.attemptedAt));

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
