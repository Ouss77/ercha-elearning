import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { getCoursesWithDetails, createCourse, getDomainById, validateTeacherAssignment } from "@/lib/db/queries"
import { createCourseSchema } from "@/lib/schemas/course"
import { ZodError } from "zod"

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Authorization check - only admins can access course management
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Get all courses with details
    const result = await getCoursesWithDetails()

    if (!result.success) {
      const errorMsg = !result.success && "error" in result ? result.error : "Erreur lors de la récupération des cours"
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    return NextResponse.json({ courses: result.data }, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching courses:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Authorization check - only admins can create courses
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Verify domain exists
    const domainResult = await getDomainById(validatedData.domainId)
    if (!domainResult.success || !domainResult.data) {
      return NextResponse.json(
        { error: "Le domaine sélectionné n'existe pas" },
        { status: 400 }
      )
    }

    // Verify teacher is valid if teacherId is provided
    if (validatedData.teacherId) {
      const teacherValidation = await validateTeacherAssignment(validatedData.teacherId)
      if (!teacherValidation.success || !teacherValidation.data) {
        return NextResponse.json(
          { error: "Le formateur sélectionné n'est pas valide" },
          { status: 400 }
        )
      }
    }

    // Create course
    const result = await createCourse(validatedData)

    if (!result.success) {
      const errorMsg = !result.success && "error" in result ? result.error : "Erreur lors de la création du cours"
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    return NextResponse.json({ course: result.data }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[API] Error creating course:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
