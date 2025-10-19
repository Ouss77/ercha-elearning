import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { 
  createEnrollment, 
  getEnrollmentsByStudentId,
  getEnrollmentsByCourseId,
  getCourseById 
} from "@/lib/db/queries"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const courseId = searchParams.get("courseId")

    if (studentId) {
      const result = await getEnrollmentsByStudentId(Number(studentId))
      if (!result.success) {
        const errorMsg = !result.success && "error" in result ? result.error : "Erreur lors de la récupération des inscriptions"
        return NextResponse.json({ error: errorMsg }, { status: 500 })
      }
      return NextResponse.json({ enrollments: result.data }, { status: 200 })
    }

    if (courseId) {
      const result = await getEnrollmentsByCourseId(Number(courseId))
      if (!result.success) {
        const errorMsg = !result.success && "error" in result ? result.error : "Erreur lors de la récupération des inscriptions"
        return NextResponse.json({ error: errorMsg }, { status: 500 })
      }
      return NextResponse.json({ enrollments: result.data }, { status: 200 })
    }

    return NextResponse.json({ error: "studentId ou courseId requis" }, { status: 400 })
  } catch (error) {
    console.error("[API] Error fetching enrollments:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Only admins and sub-admins can create enrollments
    if (user.role !== "ADMIN" && user.role !== "SUB_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, courseId, courseIds } = body

    // Support both single and multiple course enrollments
    if (courseIds && Array.isArray(courseIds)) {
      const enrollments = []
      for (const cId of courseIds) {
        // Validate that the course is active
        const courseResult = await getCourseById(Number(cId))
        if (!courseResult.success || !courseResult.data) {
          continue // Skip invalid courses
        }
        if (!courseResult.data.isActive) {
          continue // Skip inactive courses
        }
        
        const result = await createEnrollment({
          studentId: Number(studentId),
          courseId: Number(cId),
        })
        if (result.success) {
          enrollments.push(result.data)
        }
      }
      return NextResponse.json({ enrollments }, { status: 201 })
    }

    if (!studentId || !courseId) {
      return NextResponse.json({ error: "studentId et courseId requis" }, { status: 400 })
    }

    // Validate that the course is active
    const courseResult = await getCourseById(Number(courseId))
    if (!courseResult.success || !courseResult.data) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 })
    }
    if (!courseResult.data.isActive) {
      return NextResponse.json({ error: "Impossible d'inscrire à un cours inactif" }, { status: 400 })
    }

    const result = await createEnrollment({
      studentId: Number(studentId),
      courseId: Number(courseId),
    })

    if (!result.success) {
      const errorMsg = !result.success && "error" in result ? result.error : "Erreur lors de la création de l'inscription"
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    return NextResponse.json({ enrollment: result.data }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating enrollment:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
