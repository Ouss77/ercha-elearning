import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = getSession(token)
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const studentId = searchParams.get("studentId")

    // Mock data - replace with real database queries
    const progressData = {
      courseId: courseId || "1",
      studentId: studentId || user.id,
      overallProgress: 65,
      chaptersCompleted: 4,
      totalChapters: 8,
      quizzesPassed: 3,
      totalQuizzes: 6,
      averageQuizScore: 78,
      timeSpent: 240, // minutes
      lastActivity: new Date().toISOString(),
      chapterProgress: [
        { chapterId: "1", title: "Introduction", completed: true, score: 85, timeSpent: 30 },
        { chapterId: "2", title: "Concepts de base", completed: true, score: 92, timeSpent: 45 },
        { chapterId: "3", title: "Pratique", completed: true, score: 76, timeSpent: 60 },
        { chapterId: "4", title: "Avancé", completed: true, score: 68, timeSpent: 55 },
        { chapterId: "5", title: "Projet", completed: false, score: null, timeSpent: 25 },
        { chapterId: "6", title: "Tests", completed: false, score: null, timeSpent: 0 },
      ],
    }

    return NextResponse.json(progressData)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = getSession(token)
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, chapterId, action, score, timeSpent } = body

    // Here you would update the progress in the database
    console.log("Updating progress:", { userId: user.id, courseId, chapterId, action, score, timeSpent })

    // Mock response
    return NextResponse.json({
      success: true,
      message: "Progression mise à jour",
      progress: {
        chapterId,
        completed: action === "complete",
        score,
        timeSpent,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
