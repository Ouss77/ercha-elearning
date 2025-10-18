import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { enrollments } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Only admins and sub-admins can delete enrollments
    if (user.role !== "ADMIN" && user.role !== "SUB_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = params
    await db.delete(enrollments).where(eq(enrollments.id, Number(id)))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] Error deleting enrollment:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
