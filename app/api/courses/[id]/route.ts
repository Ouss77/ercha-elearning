import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import {
  getCourseWithDetails,
  getCourseById,
  updateCourse,
  deleteCourse,
  getDomainById,
  validateTeacherAssignment,
  courseHasEnrollments,
} from "@/lib/db/queries";
import { courseIdSchema, updateCourseSchema } from "@/lib/schemas/course";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Authorization check - only admins can access course management
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Validate course ID parameter
    const validatedParams = courseIdSchema.parse({ id: params.id });

    // Get course with details
    const result = await getCourseWithDetails(validatedParams.id);

    if (!result.success) {
      const errorMsg =
        !result.success && "error" in result
          ? result.error
          : "Erreur lors de la récupération du cours";
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    return NextResponse.json({ course: result.data }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "ID de cours invalide", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[API] Error fetching course:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Authorization check - only admins can update courses
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Validate course ID parameter
    const validatedParams = courseIdSchema.parse({ id: params.id });

    // Verify course exists
    const courseResult = await getCourseById(validatedParams.id);
    if (!courseResult.success || !courseResult.data) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Verify domain exists if domainId is being updated
    if (validatedData.domainId !== undefined) {
      const domainResult = await getDomainById(validatedData.domainId);
      if (!domainResult.success || !domainResult.data) {
        return NextResponse.json(
          { error: "Le domaine sélectionné n'existe pas" },
          { status: 400 }
        );
      }
    }

    // Verify teacher is valid if teacherId is being updated
    if (
      validatedData.teacherId !== undefined &&
      validatedData.teacherId !== null
    ) {
      const teacherValidation = await validateTeacherAssignment(
        validatedData.teacherId
      );
      if (!teacherValidation.success || !teacherValidation.data) {
        return NextResponse.json(
          { error: "Le formateur sélectionné n'est pas valide" },
          { status: 400 }
        );
      }
    }

    // Update course
    const result = await updateCourse(validatedParams.id, validatedData);

    if (!result.success) {
      const errorMsg =
        !result.success && "error" in result
          ? result.error
          : "Erreur lors de la mise à jour du cours";
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    return NextResponse.json({ course: result.data }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[API] Error updating course:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Authorization check - only admins can delete courses
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Validate course ID parameter
    const validatedParams = courseIdSchema.parse({ id: params.id });

    // Verify course exists
    const courseResult = await getCourseById(validatedParams.id);
    if (!courseResult.success || !courseResult.data) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Check for active enrollments
    const enrollmentsResult = await courseHasEnrollments(validatedParams.id);
    if (!enrollmentsResult.success) {
      return NextResponse.json(
        { error: "Erreur lors de la vérification des inscriptions" },
        { status: 500 }
      );
    }

    if (enrollmentsResult.data) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer un cours avec des inscriptions actives",
        },
        { status: 409 }
      );
    }

    // Delete course
    const result = await deleteCourse(validatedParams.id);

    if (!result.success) {
      const errorMsg =
        !result.success && "error" in result
          ? result.error
          : "Erreur lors de la suppression du cours";
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Cours supprimé avec succès", course: result.data },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "ID de cours invalide", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[API] Error deleting course:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
